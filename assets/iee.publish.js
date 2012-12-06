(function($) {

/*--------------------------------------------------------------------------
	Improved Entry Editor: Localization
--------------------------------------------------------------------------*/

	Symphony.Language.add({
		'An error has occurred while re-ordering fields.': false,
		'See the main log file or the JavaScript console for more details.' : false,
		'Local storage is not supported on this client.': false,
		'An error has occurred while storing information on the filesystem.': false,
		'The returned error is: {$msg}': false
	});

/*--------------------------------------------------------------------------
	Improved Entry Editor: Object
--------------------------------------------------------------------------*/

	var EntryEditor = {

		errorOccurred: false,
		storage: 'symphony.iee.' + window.location.href.split(Symphony.Context.get('root') + '/')[1].replace(/\//g, '.'),

		// -----------------------------------------------------------------
		// Improved Entry Editor: Object: Initialization
		// -----------------------------------------------------------------

		init: function() {
			var self = this;

			// One class to rule them all
			$('.primary, .secondary').addClass('sortable-container');

			// Don't panic, this doesn't prevent selection 
			// inside textinputs and textareas
			$('.sortable-container').disableSelection();

			// Check if localStorage is supported
			if(!Symphony.Support.localStorage){
				$('div.notifier').trigger('attach.notify', [
					Symphony.Language.get('Local storage is not supported on this client.'),
					'protected'
				]);
			}

			//
			// DOM Manipulation --------------------------------------------
			//

			// DOM must be altered, but I promise it's for your own good
			$('.primary, .secondary').each(function(i, el) {

				$('.field', this).each(function() {

					var label = $(this).find('label'),
						inputs = label.children(':input'),
						error = $(this).find('.invalid'),
						handler = $('<span class="handler" />'),
						header = $('<header />'),
						content = $("<div class='content' />"),
						name = label.contents().filter(function() {
							return this.nodeType == 3;
						});

					handler.append(name.text().trim());
					header.append(handler);

					// If the field contains more than one input then
					// 'Optional' shall remain inside a <label />
					if(inputs.length === 1){
						var optional = label.children('i');

						header.append(optional);

						if(inputs.attr('type') !== 'checkbox')
							name.remove();
					}

					// We assume there will be at most one error per field,
					// which unfortunately is not always true
					if(error.length === 1)
						error.wrap(content)
					else
						label.wrap(content);

					// Effective DOM manipulation happens here
					$(this).prepend(header);

					// This will be useful later during sorting
					$(this).data('container', el);

				});

			 });

			//
			// Sortable plugin ---------------------------------------------
			//

			// Initialize the sortable plugin
			$('.sortable-container').sortable({

				items:				'.field',
				connectWith:		'.sortable-container',
				placeholder:		'field-placeholder',
				handle:				'header',
				revert:				200,
				tolerance:			'pointer',
				delay:				150,
				cursor:				'move',
				cursorAt:			{ left: 150, top: 15 },

				start: function(event, ui) {
					self.onSortStart(event, ui);
				},
				over: function(event, ui) {
					self.onSortOver(event, ui);
				},
				stop: function(event, ui) {
					self.onSortStop(event, ui);
				}
			});

			//
			// Collapsible plugin ------------------------------------------
			//

			// Initialize the collapsible plugin
			$('.sortable-container').symphonyCollapsible({
				items:				'.field',
				handles:			'header',
				content:			'.content',
				//ignore:				'header .handler'
				save_state:			false
			});

			// Restore the saved state from the filesystem
			if(window.localStorage[self.storage]){
				$.each(window.localStorage[self.storage].split(','), function(index, value) {
					$('#field-' + value).trigger('collapse.collapsible', [0]);
				});
			}

			// Every time a field is expanded or collapsed
			// its state is stored on the fileystem so that
			// it survives page refreshes
			$('.field').on('expandstop.collapsible collapsestop.collapsible', function() {
				self.saveCollapsibleState();
			});

		},

		// -----------------------------------------------------------------
		// Improved Entry Editor: Object: Sortable event handling
		// -----------------------------------------------------------------

		// The placeholder is as tall as the field box
		// being currently dragged
		onSortStart: function(event, ui) {

			// We don't want the collapsible plugin to
			// interfere with sortable
			ui.item.addClass('locked');

			$('.field-placeholder').height(
				ui.helper.height()
				+ parseInt(ui.helper.css('padding-top'))
				+ parseInt(ui.helper.css('padding-bottom'))
				+ parseInt(ui.helper.css('border-top-width'))
				+ parseInt(ui.helper.css('border-bottom-width'))
			);
		},

		// Every time we cross the boundary between
		// .primary and .secondary, the field box size
		// changes according to the column's width
		onSortOver: function(event, ui){
			$('.primary, .secondary').on('sortover', function(event, ui) {
				if(ui.helper.data('container') !== this){
					ui.helper.data('container', this);

					ui.helper.animate({
						'width': $('.field-placeholder').width(),
					}, 100);
				}
			});
		},

		// The old order is gone, long live the new order!
		onSortStop: function(event, ui) {
			var self = this,
				post_data = '',
				idx = 0;

			$('.primary, .secondary').each(function(i) {
				var sort_order = 1;

				$('.field', this).each(function() {
					post_data += 'field[' + idx + '][id]=' + $(this).attr('id').replace(/^field-/,'') + '&';
					post_data += 'field[' + idx + '][location]=' + ((i == 0) ? 'main' : 'sidebar') + '&';
					post_data += 'field[' + idx + '][sortorder]=' + sort_order++ + '&';

					idx++;
				});
			});

			$.ajax({
				type: 'POST',
				url: Symphony.Context.get('root') + '/symphony/extension/iee/save_order/',
				data: post_data,
				success: function(data, textStatus, jqXHR) {
					console.log(data); console.log(textStatus);
					if(data !== true){
						self.onErrorReordering();
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.log(textStatus + ': ' + errorThrown);
					self.onErrorReordering();
				}
			});

			// It is safe now to remove the lock
			ui.item.removeClass('locked');

		},

		onErrorReordering: function() {
			var self = this;

			if(!self.errorOccurred){
				$('div.notifier').trigger('attach.notify', [
					Symphony.Language.get('An error has occurred while re-ordering fields.') + ' ' +
					Symphony.Language.get('See the main log file or the JavaScript console for more details.'),
					'error protected'
				]);

				self.errorOccurred = true;
			}
		},

		// -----------------------------------------------------------------
		// Improved Entry Editor: Object: Collapsible event handling
		// -----------------------------------------------------------------

		// Save the collapsible state of each field
		saveCollapsibleState: function() {
			if(!Symphony.Support.localStorage) return;

			var self = this,
				collapsed = $('.field').map(function() {
				if($(this).is('.collapsed')) {
					return $(this).attr('id').replace(/^field-/,'');
				};
			});

			// Put in a try/catch incase something goes wrong
			// (e.g. insufficient space, privileges, etc...)
			try {
				window.localStorage[EntryEditor.storage] = collapsed.get().join(',');
			}
			catch(e) {
				if(!self.errorOccurred){
					$('div.notifier').trigger('attach.notify', [
						Symphony.Language.get('An error has occurred while storing information on the filesystem.') + ' ' +
						Symphony.Language.get('The returned error is: {$msg}', {
							msg: message,
						}),
						'error protected'
					]);

					self.errorOccurred = true;
				}
			}
		}
	
	};

	$(document).ready(function() {
		EntryEditor.init();
	});

})(jQuery.noConflict());

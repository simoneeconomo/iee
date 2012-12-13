<?php

	Class Extension_IEE extends Extension {

		public function getSubscribedDelegates() {
			return array(
				array(
					'page'		=> '/backend/',
					'delegate'	=> 'InitaliseAdminPageHead',
					'callback'	=> 'append_assets'
				)
			);
		}

		public function append_assets($context) {
			$page = Administration::instance()->Page;

			if($page instanceof contentPublish){
				$path = URL . '/extensions/iee/assets/';

				if(Administration::instance()->Author->isDeveloper()){
					$page->addStylesheetToHead($path . 'iee.publish.css', 'screen', 50);
					$page->addScriptToHead($path . 'jquery-ui-1.9.2.custom.min.js', 55);
					$page->addScriptToHead($path . 'iee.publish.js', 75);
				}
			}
		}

	}

?>

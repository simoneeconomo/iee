<?php

	require_once(TOOLKIT . '/class.ajaxpage.php');

	Class contentExtensionIEESave_Order extends AjaxPage{

		public function view(){

			$fields = $_POST['field'];

			foreach($fields as $f) {

				try {
					Symphony::Database()->query(sprintf(
						"UPDATE tbl_fields SET location = '%s', sortorder = '%d' WHERE id = '%d'",
						Symphony::Database()->cleanValue($f['location']),
						Symphony::Database()->cleanValue($f['sortorder']),
						(int) $f['id']
					));

					$this->_Result = true;
				}
				catch(DatabaseException $ex) {
					Symphony::Log()->pushToLog(
						"[IEE] An error has occurred while re-ordering fields. " . $ex->getMessage(),
						E_USER_ERROR,
						true
					);

					$this->_Result = false;
				}

			}

		}

		public function generate(){
			header('Content-Type: application/json');
			echo json_encode($this->_Result);
		}

	}


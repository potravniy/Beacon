<?php 

	$l_user_id = 4;
	$l_path_type = $_SERVER['DOCUMENT_ROOT'] . '/i/uploads/';

	$l_path = $l_path_type . $l_user_id . '/';

	if (!file_exists($l_path)) {
		mkdir($l_path, 0644, true);
	}

	$l_name = substr(str_shuffle(MD5(microtime() + 12 * date())), 0, 17);

?>

<?php

$p_type = -1;
if (isset($_POST['type']))		{ $p_type=(int)($_POST['type']); }

// 0 - avatar
// 1 - vote image
// 2 - programm image
// 3 - project propositions
// 4 - project image
// 5 - request image

if ($p_type > -1 && $p_type <= 1000) {

	//echo 'Type ' . $p_type . ' <br />';

	require_once($_SERVER['DOCUMENT_ROOT'].'/i/bulletproof.php');
	
	//echo 'Framework uploaded <br />';
	
	$l_image = new ImageUploader\BulletProof;

	//echo 'New obj created <br />';
//require_once 'index.html';

	require_once($_SERVER['DOCUMENT_ROOT'].'/db.php');

	//echo 'DB connection established<br />';

	//echo $_COOKIE['user_id'] . ' <br />';
	//echo $_SESSION['user_id'] . ' <br />';
	
	if ($g_user_id) {	

		//echo 'User id ' . $g_user_id . ' <br />';

		// НАПИСАТЬ ЗАЩИТУ ОТ ДДОСА <---------!

		try{
			/**
			 * UPLOAD IMAGES WITH "SPECIFIC" TYPE, NAME, UPLOAD DIR.
			 * 
			 * This will upload ONLY the image types specified in the 'fileTypes()' method.
			 * In this case, the image to be uploaded will be 'gif', it will be uploaded to
			 * a folder called 'documents' or it'll be created if it does not exist 
			 * and the image will be re-named to 'awesome.gif'
			 */


			$l_path = $_SERVER['DOCUMENT_ROOT'] . '/uploads/' . $g_user_id . '/' . $p_type . '/';

			//echo 'Uploaded ' . $l_path . '<br />';

			if (!file_exists($l_path)) {
				mkdir($l_path, 0755, true);
			}

			//$bulletproof = $this->bulletproof->uploadDir($l_path);

			if($_FILES){

				$l_result = $l_image
					->limitSize(["min"=>1000, "max"=>9000000])  //limit image size (in bytes)
					->fileTypes(['jpg', 'gif', 'png', 'jpeg'])
					->shrink(array("height"=>500, "width"=>500), true) // shrink to 100*200 pixels
					->upload($_FILES['picture']); // upload to small_pics folder
			}

			//echo 'Processed <br />';

			//echo $_SERVER['DOCUMENT_ROOT'] . '/i/' . $l_result . '<br />';
			//echo $l_path . substr($l_result, 8) . '<br />';

			$l_s = $_SERVER['DOCUMENT_ROOT'] . '/i/' . $l_result;
			$l_d = $l_path . substr($l_result, 8) ;

			if ($l_result <> '') {
				rename ($l_s, $l_d);
			}

			$l_url = substr($l_result, 8);

			//echo 'Moved ' . $l_url . '<br />';

			if ($p_type == 0) {

				$l_query = sprintf('
								SET @user_id = %d;
								SET @img = "%s";

								UPDATE `users`
									SET `avatar` = @img
									WHERE `user_id` = @user_id;
								', $g_user_id, $l_url);

				$l_q = mysql_exec($l_query);
			}

			echo '/uploads/' . $g_user_id . '/' . $p_type . '/' . substr($l_result, 8);

			 /* Always use the try/catch block to handle errors */
		}catch(\ImageUploader\ImageUploaderException $e){
			echo $e->getMessage();
		}
	} else {
		echo '[{"error":"User must be loged in!", "error_uk":"Користувач повинен ввійти в систему!", "error_ru":"Пользователь должен войти в систему!"}]';
	}
} else {
	echo '[{"error":"Wrong type!", "error_uk":"Не вірний тип!", "error_ru":"Не верный тип!"}]';
}
?>

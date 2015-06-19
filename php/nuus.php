<?php
require_once("classes/nuus.class.php");
require_once("classes/itumalos.class.php");

	$nuus = new Nuus();
	$jsonArray['nuus'] = $nuus->getNuus();
	$itumalos = new Itumalos();
	$jsonArray['itumalos'] = $itumalos->getAll();

echo json_encode($jsonArray);

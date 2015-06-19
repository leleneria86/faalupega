<?php

class DbUtil {
    
	protected $servername = "localhost";
	protected $username = "root";
	protected $password = "";

	public function getConnection($db_conn_info = null)
	{
		$servername = "localhost";
		$username = "root";
		$password = "";
		
		try {
			$conn = new PDO("mysql:host=$this->servername;dbname=test", $this->username, $this->password);
			// set the PDO error mode to exception
			$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			return $conn;
			}
		catch(PDOException $e)
			{
			echo "Connection failed: " . $e->getMessage();
			}
	}
}

?>

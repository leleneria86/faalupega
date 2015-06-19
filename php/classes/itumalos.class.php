<?php

require_once('dbUtil.php');

class Itumalos {
    
    protected $itumalos      = null;
    
    public function getAll()
    {
        $db_util = new DbUtil();
        $conn = $db_util->getConnection();

        try {
           $this->loadData($conn);
           
        } catch(PDOException $ex) {
           //handle me.
        }
        return $this->itumalos;		
    }
	
    protected function loadData($db) {

        $this->itumalos = array();
        $sql = "SELECT * FROM itumalo";
        $stmt = $db->query($sql);
        $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach($rs as $row)
        {
            $motu_id = $row['motu_id'];
            if(isset($this->itumalos[$motu_id]))
            {
                $this->itumalos[$motu_id][] = array("name"=>$row['name']);
            }
			else
			{
				$this->itumalos[$motu_id][] = array("name"=>'');
				$this->itumalos[$motu_id][] = array("name"=>$row['name']);
			}
        }
    }
}
?>
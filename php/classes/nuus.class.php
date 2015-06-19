<?php

require_once('dbUtil.php');

class Nuus {
    
    protected $nuus        = null;
	protected $vaegas      = null;
    
    public function getNuus()
    {
        $db_util = new DbUtil();
        $conn = $db_util->getConnection();

        try {
			$this->initVaegas($conn);
			$this->nuus = $this->getData($conn);
        } catch(PDOException $ex) {
           //handle me.
        }
        return $this->nuus;		
    }
	
    protected function initVaegas($db) {

        $this->vaegas = array();
        $sql = "SELECT * FROM vaega";
        $stmt = $db->query($sql);
        $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach($rs as $row)
        {
            $nuu_id = $row['nuu_id'];
			$vaega_type = $row['vaega_type'];
            if(isset($this->vaegas[$nuu_id]))
            {
                if(isset($this->vaegas[$nuu_id][$vaega_type]))
                {
                    array_push($this->vaegas[$nuu_id][$vaega_type], $row['data']);
                }
                else
                {
					$this->vaegas[$nuu_id][$vaega_type] = array($row['data']);	
                }
            }
			else
			{
				$this->vaegas[$nuu_id] = array($vaega_type=>array($row['data']));
			}
        }
    }
    
    protected function getData($db) {

            //$stmt = $db->prepare("SELECT * FROM table WHERE id=? AND name=?");
            //$stmt->execute(array($id, $name));

        $sql = "SELECT n.*,m.name AS motu,i.name AS itumalo
                        FROM
                          nuu n LEFT JOIN motu m ON n.motu_id=m.id LEFT JOIN itumalo i ON n.itumalo_id=i.id";
        $stmt = $db->query($sql);
        $rs = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$cnt = count($rs);
		for($i = 0; $i < $cnt; $i++)
		{
			$vaega = $this->getVaega($rs[$i]['id']);
			if($vaega !== null)
			{
				foreach($vaega as $key=>$val)
				{
					$rs[$i][$key] = $val;
				}
			}
		}
		return $rs;
    }
	
	protected function getVaega($nuu_id)
	{
		if(isset($this->vaegas[$nuu_id]))
		{
			return $this->vaegas[$nuu_id];
		}
		return null;
	}
}
?>
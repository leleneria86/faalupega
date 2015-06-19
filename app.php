<?PHP
require_once("./include/membersite_config.php");

if(!$fgmembersite->CheckLogin())
{
    $fgmembersite->RedirectToURL("login.php");
    exit;
}
?>

<!DOCTYPE html>
<html ng-app="Angello">
<script src="/js/bower_components/angular/angular.js" type="text/javascript"></script>
<script src="http://m-e-conroy.github.io/angular-dialog-service/javascripts/dialogs.min.js" type="text/javascript"></script>
<script type="text/javascript" src="jquery.js"></script> 
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
<script src="/js/jquery.blockUI.js" type="text/javascript"></script>
<script>
 $(function() {});
</script>

<body>
  <div ng-app="Angello" data-framework="angularjs" ng-controller="MainCtrl" data-ng-init="load()">
      <form class="form-inline pull-right">
        <div class="form-search search-only" style="margin-bottom:20px;">
            <input ng-change="changeEvent()" ng-model="searchText" placeholder="Search Results" class="form-control search-query" type="text">
        </div>
    </form>
	
	<div class="control-group">
      <label class="control-label" for="inputType">Motu</label>
      <div class="controls">
        <select id="inputMotu"
          ng-model="currentMotu"
          ng-options="t.name for t in motus"
		  ng-change="changeMotu(currentMotu)" style="width:120px"></select>
      </div>
    </div>  
	
	<div class="control-group" ng-show="currentMotu.name != ''">
      <label class="control-label" for="inputType">Itumalo</label>
      <div class="controls">
        <select id="inputItumalo"
          ng-model="currentItumalo"
          ng-options="t.name for t in itumalos"
		  ng-change="changeItumalo(currentItumalo)"  style="width:120px"></select>
      </div>
    </div>
	
    <div class="span4 sidebar-content" ng-show="showNuus()">
	<br/>
	<h4 class="pull-left" style="cursor:pointer"><a ng-click="predicate = 'name'; reverse=!reverse">Alalafaga</a></h4>
	<table cellspacing="5" cellpadding="5">
      <tr ng-repeat="nuu in nuus | orderBy:predicate:reverse" ng-click="setCurrentStory(story)">
        <td><a ng-click="toggleStory(nuu.id)" href="">{{nuu.name}}</a>
        <div ng-show="showStory(nuu.id)">
			<div><br/><b>Fa'alupega</b></div>
            <div>{{nuu.faalupega}}</div>
			<div ng-show="nuu.malae.length > 0"><br/><div><b>Malae</b></div>
				<table>
					<tr ng-repeat="name in nuu.malae">
						<td>{{name}}</td>
					</tr>
				</table>
			</div>
			<div ng-show="nuu.maota.length > 0"><br/><div><b>Maota</b></div>
				<table>
					<tr ng-repeat="name in nuu.maota">
						<td>{{name}}</td>
					</tr>
				</table>
			</div>
			<div ng-show="nuu.lagi.length > 0"><br/><div><b>Lagi</b></div>
				<table>
					<tr ng-repeat="name in nuu.lagi">
						<td>{{name}}</td>
					</tr>
				</table>
			</div>
        </div></td>
      </tr>
	</table>
    </div>

  </div>
  
<script src="js/model/tutuila.js"></script>  
<script src="js/app.js"></script>
</body>
</html>
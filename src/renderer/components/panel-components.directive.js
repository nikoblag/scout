
angular.module('scout').directive('panelHeader', function () {
  return {
    restrict: 'E',
    scope: {
      nav: "=navigation"
    },
    templateUrl: 'templates/panel-header.html'
  };
});

angular.module('scout').directive('panelBody', function () {
  return {
    restrict: 'E',
    link: function (scope, element, attrs) {
      scope.$watch(attrs.view, function(value) {
        scope.view = value;
      });
    },
    template: '<div class="panel-body"> <ng-include src="view"></ng-include> </div>'
  };
});

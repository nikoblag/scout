'use babel';

angular.module("scout").controller('ResponsePanelCtrl', function ($scope) {
  let self = this;
  let decodeWwwForm = require('../util/decodeWwwForm');
  let {CompositeDisposable} = require('event-kit');
  let subscriptions = new CompositeDisposable();

  self.response = scout.envelope.response;
  self.nav = new ResponseNavigation();

  subscriptions.add(
    self.response.onDidChange('body', (changes) => {
      let {header: contentTypeHeader} = self.response.findHeader('Content-Type');
      let contentType = contentTypeHeader ? contentTypeHeader.value.split(';')[0] : undefined;

      $scope.$apply(() => {
        if (contentType === 'application/x-www-form-urlencoded') {
          self.decodedBody = decodeWwwForm(self.response.body);
        } else {
          self.decodedBody = null;
        }
      });
    })
  );

  $scope.$on("$destroy", () => {
    subscriptions.dispose();
    subscriptions = null;
  });
});

let PanelNavigation = require('../common/panel-nav');

class ResponseNavigation extends PanelNavigation {
  constructor() {
    super();
    this.model = [
      {targetViewId: 'headers', label: 'Headers'},
      {targetViewId: 'body', label: 'Body'},
      {targetViewId: 'raw', label: 'Raw'}
    ];

    this.templatePartialPath = 'templates/nav-response-';
    this.select('headers');
  }
}

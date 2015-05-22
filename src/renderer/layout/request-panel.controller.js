'use babel';

angular.module("scout").controller('RequestPanelCtrl', function ($scope) {
  let self = this;
  let {CompositeDisposable} = require('event-kit');
  let subscriptions = new CompositeDisposable();

  self.request = scout.envelope.request;
  self.newHeaderName = '';
  self.newHeaderValue = '';
  self.newParamName = '';
  self.newParamValue = '';
  self.nav = new RequestNavigation();

  subscriptions.add(
    scout.storage.onDidChange("hints:headers", (event) => {
      let headerHints = [];
      let headers = event.newValue;

      for (let name in headers) {
        let metadata = headers[name];
        headerHints.push({
          name: name.replace(/\\\./g, '.'),
          type: metadata.type,
          description: metadata.description,
          moreLink: metadata.moreLink
        });
      }

      self.headerHints = headerHints;
    })
  );

  // TODO: Provide a central place to load and work with hints
  let hintsConfig = scout.storage.requireStorageFile("hints");

  hintsConfig.transact(() => {
    hintsConfig.setDefaults("headers", require("../../../config/hintmap.json").headers);
  });

  self.valueHintsForHeader = (headerName) => {
    let safeHeaderName = headerName.replace(/\./g, '\\.');
    let values = scout.storage.get(`hints:headers.${safeHeaderName}.values`) || {};
    let result = [];

    for (let key in values) {
      let metadata = values[key];
      result.push({
        name: key.replace(/\\\./g, '.'),
        type: metadata.type,
        description: metadata.description,
        moreLink: metadata.moreLink
      });
    }

    return result;
  };

  self.submitHeader = () => {
    if (self.newHeaderName === undefined ||
        self.newHeaderName === null ||
        self.newHeaderName === '') {
      return;
    }

    self.request.addHeader(self.newHeaderName, self.newHeaderValue);

    let safeHeaderName = self.newHeaderName.replace(/\./g, '\\.');
    let safeHeaderValue = self.newHeaderValue.replace(/\./g, '\\.');
    let headerNameKeyPath = `hints:headers.${safeHeaderName}`;
    let headerValueKeyPath = `hints:headers.${safeHeaderName}.values.${safeHeaderValue}`;

    if (!scout.storage.get(headerNameKeyPath)) {
      scout.storage.set(headerNameKeyPath, {type: 'xh-user-header'});
    }

    if (!scout.storage.get(headerValueKeyPath)) {
      scout.storage.set(headerValueKeyPath, {type: 'x-user-header-value'});
    }

    self.newHeaderName = '';
    self.newHeaderValue = '';
  };

  self.submitParam = () => {
    if (self.newParamName === undefined ||
        self.newParamName === null ||
        self.newParamName === '') {
      return;
    }

    self.request.addParameter(self.newParamName, self.newParamValue);
    self.newParamName = '';
    self.newParamValue = '';
  };

  $scope.$on("$destroy", () => {
    self.headerHints = null;
    subscriptions.dispose();
    subscriptions = null;
  });
});

let PanelNavigation = require('../common/panel-nav');

class RequestNavigation extends PanelNavigation {
  constructor() {
    super();
    this.model = [
      {targetViewId: 'headers', label: 'Headers'},
      {targetViewId: 'params', label: 'Parameters'},
      {targetViewId: 'body', label: 'Body'},
      {targetViewId: 'raw', label: 'Raw'},
      {targetViewId: 'options', label: 'Options', iconClass: 'fa fa-gear fa-lm'}
    ];

    this.templatePartialPath = 'templates/nav-request-';
    this.select('headers');
  }
}

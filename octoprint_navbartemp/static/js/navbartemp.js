$(function() {
    function NavbarTempViewModel(parameters) {
        var self = this;

        self.navBarTempModel = parameters[0];
        self.global_settings = parameters[1];
        self.control = parameters[2]; // self.control.fanSpeed()
        self.terminal = parameters[3]; //  self.terminal.command("M107"); self.terminal.sendCommand();
        self.wasReadyBefore = true;
        self.watchShutdownTemp = false;
        
        self.raspiTemp = ko.observable();
        self.isRaspi = ko.observable(false);

        self.formatBarTemperature = function(toolName, actual, target) {
            if (toolName === 'Tool' && self.settings.shutdownFan()) {
                self.watchShutdownTemperature(actual, target);
            }

            var output = toolName + ': ' + _.sprintf('%.1f&deg;C', actual);

            if (target) {
                var sign = (target >= actual) ? ' <span class="text-error">\u21D7 ' : ' <span class="text-success">\u21D8 ';
                output += '<small>' + sign + _.sprintf('%.1f&deg;C', target) + '</span></small>';
            }

            return output;
        };
        
        self.watchShutdownTemperature = function (actual, target) {
            if (!self.settings.shutdownFan()) {
                return;
            }

            var isReady = self.control.isReady();
            if (!self.watchShutdownTemp) {
                if (isReady && !self.wasReadyBefore) {
                    console.log('Auto tool fan shutdown: Ready state changed.');
                    self.watchShutdownTemp = true;
                } else if (actual > self.settings.shutdownTemp()) {
                    console.log('Auto tool fan shutdown: Temperature limit exceeded (' + self.settings.shutdownTemp() + ')°');
                    self.watchShutdownTemp = true;
                }
            }
            self.wasReadyBefore = isReady;
            
            if (self.watchShutdownTemp && target === 0 && actual < self.settings.shutdownTemp()) {
                console.log('Auto tool fan shutdown: Shutting down NOW. Temperature below ' + self.settings.shutdownTemp() + '°');
                self.watchShutdownTemp = false;
                self.terminal.command('M107'); self.terminal.sendCommand();
            }
        }
        
        self.onBeforeBinding = function () {
            self.settings = self.global_settings.settings.plugins.navbartemp;
        };
        
        self.onDataUpdaterPluginMessage = function(plugin, data) {
            if (plugin != 'navbartemp') {
                return;
            }

            if (!data.hasOwnProperty('israspi')) {
                self.isRaspi(false);
                return;
            } else {
                self.isRaspi(true);
            }

            self.raspiTemp(_.sprintf('RPi: %.1f&deg;C', data.raspitemp));
        };
    }

    ADDITIONAL_VIEWMODELS.push([
        NavbarTempViewModel, 
        ['temperatureViewModel', 'settingsViewModel', 'controlViewModel', 'terminalViewModel'],
        ['#navbar_plugin_navbartemp', '#settings_plugin_navbartemp']
    ]);
});

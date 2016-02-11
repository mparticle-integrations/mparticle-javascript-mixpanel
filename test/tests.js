describe('Mixpanel Forwarder', function () {

    var ReportingService = function () {
        var self   = this;
        this.id    = null;
        this.event = null;

        this.cb = function (forwarder, event) {
            self.id    = forwarder.id;
            self.event = event;
        };

        this.reset = function () {
            this.id    = null;
            this.event = null;
        };
    },
    MessageType = {
        SessionStart: 1,
        SessionEnd  : 2,
        PageView    : 3,
        PageEvent   : 4,
        CrashReport : 5,
        OptOut      : 6,
        Commerce    : 16
    },
    EventType = {
        Unknown       : 0,
        Navigation    : 1,
        Location      : 2,
        Search        : 3,
        Transaction   : 4,
        UserContent   : 5,
        UserPreference: 6,
        Social        : 7,
        Other         : 8,
        Media         : 9,
        getName: function () {
            return 'blahblah';
        }
    },
    ProductActionType = {
        Unknown           : 0,
        AddToCart         : 1,
        RemoveFromCart    : 2,
        Checkout          : 3,
        CheckoutOption    : 4,
        Click             : 5,
        ViewDetail        : 6,
        Purchase          : 7,
        Refund            : 8,
        AddToWishlist     : 9,
        RemoveFromWishlist: 10,
        getName: function () {
            return 'Action';
        }
    },
    PromotionActionType = {
        Unknown       : 0,
        PromotionView : 1,
        PromotionClick: 2,
        getName: function () {
            return 'promotion action type';
        }
    },
    IdentityType = {
        Other                   : 0,
        CustomerId              : 1,
        Facebook                : 2,
        Twitter                 : 3,
        Google                  : 4,
        Microsoft               : 5,
        Yahoo                   : 6,
        Email                   : 7,
        Alias                   : 8,
        FacebookCustomAudienceId: 9,
        getName: function () {
            return 'CustomerID';
        }
    },
    reportService = new ReportingService();

    function MPMock () {
        var self          = this;
        var calledMethods = ['alias', 'track', 'identify', 'register', 'unregister', 'trackCharge', 'clearCharges'];

        for (var i = 0; i < calledMethods.length; i++) {
            this[calledMethods[i] + 'Called'] = false;
        }

        this.data = null;

        this.track         = function(data) {
            setCalledAttributes(data, 'trackCalled');
        };

        this.identify      = function (data) {
            setCalledAttributes(data, 'identifyCalled');
        };

        this.alias         = function (data) {
            setCalledAttributes(data, 'aliasCalled');
        };

        this.register      = function (data) {
            setCalledAttributes(data, 'registerCalled');
        };

        this.unregister    = function (data) {
            setCalledAttributes(data, 'unregisterCalled');
        };

        this.track_charge  = function (data) {
            setCalledAttributes(data, 'trackChargeCalled');
        };

        this.clear_charges = function (data) {
            setCalledAttributes(data, 'clearChargeCalled');
        };

        function setCalledAttributes(data, attr) {
            self.data  = data;
            self[attr] = true;
        }
    }

    before(function () {
        mParticle.forwarder.init({
            includeUserAttributes: 'True'
        }, reportService.cb, true);

        mParticle.ProductActionType = ProductActionType;
        mParticle.EventType         = EventType;
        mParticle.IdentityType      = IdentityType;
        mParticle.PromotionType     = PromotionActionType;
    });

    beforeEach(function () {
        window.mixpanel = new MPMock();
    });

    describe('Logging events', function() {

        it('should log event', function(done) {
            mParticle.forwarder.process({
                EventDataType : MessageType.PageEvent,
                EventName     : 'Test Page Event'
            });

            window.mixpanel.should.have.property('trackCalled', true);
            window.mixpanel.data.should.be.instanceof(Array).and.have.lengthOf(3);

            window.mixpanel.data[0].should.be.type('string');
            window.mixpanel.data[1].should.be.type('string');
            window.mixpanel.data[2].should.be.instanceof(Object);

            window.mixpanel.data[0].should.be.equal('record');
            window.mixpanel.data[1].should.be.equal('Test Page Event');
            Should(window.mixpanel.data[2]).eql({});

            done();
        });

    });

    describe('User events', function() {

        it('should alias user', function(done) {
            mParticle.forwarder.setUserIdentity('dpatel@mparticle.com', mParticle.IdentityType.Alias);
            window.mixpanel.should.have.property('aliasCalled', true);
            window.mixpanel.should.have.property('data', 'dpatel@mparticle.com');

            done();
        });

        it('should identify user', function(done) {
            mParticle.forwarder.setUserIdentity('dpatel@mparticle.com', mParticle.IdentityType.CustomerId);
            window.mixpanel.should.have.property('identifyCalled', true);
            window.mixpanel.should.have.property('data', 'dpatel@mparticle.com');

            done();
        });

        it('should register a user', function(done) {
            mParticle.forwarder.setUserAttribute('email', 'dpatel@mparticle.com');
            window.mixpanel.should.have.property('registerCalled', true);
            window.mixpanel.data.should.be.an.instanceof(Object).and.have.property('email', 'dpatel@mparticle.com');

            done();
        });

        it('should unregister a user', function(done) {
            mParticle.forwarder.removeUserAttribute('dpatel@mparticle.com');
            window.mixpanel.should.have.property('unregisterCalled', true);
            window.mixpanel.should.have.property('data', 'dpatel@mparticle.com');

            done();
        });

    });

    describe('Transaction events', function() {

        it('should track charge event', function(done) {
            mParticle.forwarder.init({
                includeUserAttributes: 'True',
                useMixpanelPeople    : 'True'
            }, reportService.cb, true);

            mParticle.forwarder.process({
                EventDataType : MessageType.Commerce,
                EventName     : 'Test Purchase Event',
                ProductAction : {
                    ProductActionType: mParticle.ProductActionType.Purchase,
                    TotalAmount      : 10
                }
            });

            window.mixpanel.should.have.property('trackChargeCalled', true);
            window.mixpanel.should.have.property('data', 10);

            done();
        });

        it('should enfore useMixpanelPeople to charge', function(done) {
            mParticle.forwarder.init({
                includeUserAttributes: 'True',
            }, reportService.cb, true);

            mParticle.forwarder.process({
                EventDataType : MessageType.Commerce,
                EventName     : 'Test Purchase Event',
                ProductAction : {
                    ProductActionType: mParticle.ProductActionType.Purchase,
                    TotalAmount      : 10
                }
            });

            window.mixpanel.should.have.property('trackChargeCalled', false);
            window.mixpanel.should.have.property('data', null);

            done();
        });

    });

});

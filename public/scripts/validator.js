// TODO: add custom validation rules (figure out)
var validator = {
    init: function() {
        validator.passwordMatch();
    },

    passwordMatch: function() {
        $.validate({}); 
    }
}

validator.init();
import React, { Component } from 'react';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';
import { SignUpFunc } from '../actions/index';

class SignUp extends Component {

  onSubmit(props) {
    console.log(props);
    SignUpFunc(props);
  }


  render() {
    const { fields: { firstName,
                      lastName,
                      address,
                      phoneNumber,
                      email,
                      userName,
                      password,
                    }, handleSubmit } = this.props;

    return (
      <div className="top-margin">
        <div className="container">

          <div className="row">
            <div className="col-md-10 col-md-offset-1">

              <div className="row">
                <div className="col-md-6 col-md-offset-3">

                  <form className="form-signin" onSubmit={handleSubmit(this.onSubmit)}>
                    <fieldset>
                      <h3 className="form-signin-heading">Sign Up</h3>
                      <div className="text-help">
                        <div className={`form-group ${firstName.touched && firstName.invalid ? 'has-danger' : ''}`}>
                          <input type="text" className="form-control" placeholder="First Name" {...firstName} />
                        </div>

                        <div className={`form-group ${lastName.touched && lastName.invalid ? 'has-danger' : ''}`}>
                          <input type="text" className="form-control" placeholder="Last Name" {...lastName} />
                        </div>

                        <div className={`form-group ${address.touched && address.invalid ? 'has-danger' : ''}`}>
                          <input type="text" className="form-control" placeholder="Address" {...address} />
                        </div>

                        <div className={`form-group ${phoneNumber.touched && phoneNumber.invalid ? 'has-danger' : ''}`}>
                          <input type="text" className="form-control" placeholder="phone Number" {...phoneNumber} />
                        </div>

                        <div className={`form-group ${email.touched && email.invalid ? 'has-danger' : ''}`}>
                          <input type="text" className="form-control" placeholder="Email Address" {...email} />
                        </div>

                        <div className={`form-group ${userName.touched && userName.invalid ? 'has-danger' : ''}`}>
                          <input type="text" className="form-control" placeholder="Username" {...userName} />
                        </div>

                        <div className={`form-group ${password.touched && password.invalid ? 'has-danger' : ''}`}>
                          <input type="password" className="form-control" placeholder="Password" {...password} />
                        </div>

                      </div>
                      <button className="btn btn-md btn-primary btn-block" type="submit">Sign Up</button>
                      <div className="pull-right">
                        <Link to="signIn">Already have an account? Sign in here!</Link>
                      </div>
                    </fieldset>
                  </form>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }
}

const validate = (values) => {
  const errors = {};

  if (!values.firstName) {
    errors.firstName = 'Please enter first name';
  }

  if (!values.lastName) {
    errors.lastName = 'Please enter last name';
  }

  if (!values.address) {
    errors.address = 'Please enter a valid address';
  }

  if (!values.phoneNumber) {
    errors.phoneNumber = 'Please enter a phone number';
  }

  if (!values.email) {
    errors.email = 'Please enter valid email';
  }

  if (!values.userName) {
    errors.userName = 'Plesae enter username';
  }

  if (!values.password) {
    errors.password = 'Please enter password';
  }

  return errors;
};

export default reduxForm({
  form: 'SignUpForm',
  fields: ['firstName',
           'lastName',
           'address',
           'phoneNumber',
           'email',
           'userName',
           'password'],
  validate,
})(SignUp);

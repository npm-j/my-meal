import axios from 'axios';
import { browserHistory } from 'react-router';
import { convertAddress, reviewAverage } from '../utils/helper';
const _ = require('lodash');

export const MAP_CENTER = 'MAP_CENTER';
export const SELECT_EVENT = 'SELECT_EVENT';
export const CREATE_EVENT = 'CREATE_EVENT';
export const GET_ALL_EVENTS = 'GET_ALL_EVENTS';
export const AUTH_USER = 'AUTH_USER';
export const AUTH_ERROR = 'AUTH_ERROR';
export const UNAUTH_USER = 'UNAUTH_USER';
export const GET_EVENTS_BY_USER_ID = 'GET_EVENTS_BY_USER_ID';
export const CHEF_EVENTS = 'CHEF_EVENTS';
export const CHEF_PAST_EVENTS = 'CHEF_PAST_EVENTS';
export const CHEF_UPCOMING_EVENTS = 'CHEF_UPCOMING_EVENTS';
export const POST_USER_REVIEW_OF_CHEF = 'POST_USER_REVIEW_OF_CHEF';
export const SEND_EVENT_ID = 'SEND_EVENT_ID';
export const CLOSE_CHAT_BOX = 'CLOSE_CHAT_BOX';
export const ALL_GENRES = 'ALL_GENRES';
export const ALL_RESTRICTIONS = 'ALL_RESTRICTIONS';
export const GET_EVENTS_TO_BE_REVIEWED = 'GET_EVENTS_TO_BE_REVIEWED';
export const USER_INFO = 'USER_INFO';


export const getEventsByUserId = (userId) => {
  console.log('userId is....');
  return axios.get(`/api/event/users/${userId}`)
    .then((response) => {
      return {
        type: GET_EVENTS_BY_USER_ID,
        payload: response,
      };
    })
    .catch((err) => {
      if (err) {
        throw err;
      }
    });
};

export const getEventsToBeReviewed = (userId) => {
  return axios.get(`/api/review/${userId}`)
    .then((reviews) => {
      return {
        type: GET_EVENTS_TO_BE_REVIEWED,
        payload: reviews,
      };
    })
    .catch((err) => {
      if (err) {
        throw err;
      }
    });
};

/** *************** AUTHENTICATIONS *********************/

export const SignInFunc = (props) => {
  const email = props.email;
  const password = props.password;
  return (dispatch) => {
    return axios({
      method: 'POST',
      url: '/api/auth/login',
      data: {
        email,
        password,
      },
    })
      .then((response) => {
      // dispatch action to update state to indicate that user is authenticated
        dispatch({
          type: AUTH_USER,
        });
        dispatch({
          type: USER_INFO,
          payload: response.data.user,
        });

        // save token to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.userName);
        localStorage.setItem('userPic', response.data.user.userPic);

        return getEventsByUserId(response.data.user.id)
          .then((action) => {
            dispatch(action);
            browserHistory.push('/');
          });
      })
      .catch(() => {
        dispatch({
          type: AUTH_ERROR,
          payload: 'Invalid email or password',
        });
      });
  };
};

export const SignUpFunc = (props, userPic) => {
  const firstName = props.firstName;
  const lastName = props.lastName;
  const address = props.address;
  const phoneNumber = props.phoneNumber;
  const userName = props.userName;
  const email = props.email;
  const password = props.password;

  const data = new FormData();
  data.append('file', userPic[0]);
  const opts = {
    transformRequest() { return data; },
  };

  return function (dispatch) {
    return axios.post('/api/event/picture', data, opts)
      .then((resp) => {
        const url = resp.data;
        return url;
      })
      .then((url) => {
        return axios({
          method: 'POST',
          url: '/api/auth/signup',
          data: {
            firstName,
            lastName,
            address,
            phoneNumber,
            userName,
            email,
            password,
            userPic: url,
          },
        })
          .then((response) => {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('id', response.data.result.id);
            localStorage.setItem('userPic', response.data.result.userPic);
            dispatch({
              type: AUTH_USER,
            });
            browserHistory.push('/');
          })
          .catch(() => {
            dispatch({
              type: AUTH_ERROR,
            });
          });
      });
  };
};

export const SignOutFunc = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPic');
  browserHistory.push('/');
  return {
    type: UNAUTH_USER,
  };
};

/** **********************USER FUNCTIONS**************************/

export const editUser = (userAttr) => {
  const userId = localStorage.getItem('userId');
  console.log('inside editUser......', userAttr);
  return function (dispatch) {
    return axios.put(`/api/user/${userId}`, userAttr)
      .then((response) => {
        console.log('response to editUser is....', response);
      // action dispatch on response should be the new updated user info
        dispatch({
          type: USER_INFO,
          payload: response.data,
        });
        return response;
      })
      .catch((err) => {
        throw err;
      });
  };
};

/** ********************* CHEF DASHBOARD ***********************/

export const ChefEventsFunc = () => {
  const currentDate = new Date(Date.now());
  const userId = localStorage.getItem('userId');

  let chefEventsArray;

  return (dispatch) => {
    return axios({
      method: 'GET',
      url: `/api/event/users/${userId}`,
    })
      .then((response) => {
        chefEventsArray = response.data;

        return Promise.all(_.filter(chefEventsArray, (event) => {
          return event.UsersEvent.role === 'host';
        }))
          .then((chefEventFiltered) => {
            return Promise.all(_.map(chefEventFiltered, (event) => {
              const eventId = event.UsersEvent.eventId;
              return axios({
                method: 'GET',
                url: `/api/review/event/${eventId}`,
              })
                .then((reviews) => {
                  event.reviews = reviews.data;
                  const ratingArray = [];
                  _.each(event.reviews, (review) => {
                    if (typeof review.rating === 'number') {
                      ratingArray.push(review.rating);
                    }
                  });
                  event.rating = reviewAverage(ratingArray);
                  return event;
                });
            }));
          })
          .then((result) => {
            dispatch({
              type: CHEF_EVENTS,
              payload: result,
            });
          });
      })
      .catch((err) => {
        throw err;
      });
  };
};


export const DeleteEvent = (eventId) => {
  const currentDate = new Date(Date.now());
  const userId = localStorage.getItem('userId');

  let chefEventsArray;

  return (dispatch) => {
    return axios({
      method: 'DELETE',
      url: `/api/event/${eventId}`,
    })
      .then(() => {
        return axios({
          method: 'GET',
          url: `/api/event/users/${userId}`,
        })
          .then((response) => {
            chefEventsArray = response.data;
            return Promise.all(_.filter(chefEventsArray, (event) => {
              return event.UsersEvent.role === 'host';
            }))
              .then((chefEventFiltered) => {
                return Promise.all(_.map(chefEventFiltered, (event) => {
                  const eventID = event.UsersEvent.eventID;
                  return axios({
                    method: 'GET',
                    url: `/api/review/event/${eventID}`,
                  })
                    .then((reviews) => {
                      event.reviews = reviews.data;
                      const ratingArray = [];
                      _.each(event.reviews, (review) => {
                        if (typeof review.rating === 'number') {
                          ratingArray.push(review.rating);
                        }
                      });
                      event.rating = reviewAverage(ratingArray);
                      return event;
                    });
                }));
              })
              .then((result) => {
                dispatch({
                  type: CHEF_EVENTS,
                  payload: result,
                });
              });
          })
          .catch((err) => {
            throw err;
          });
      });
  };
};


/** ***************** EVENT FUNC ***********************/

export const getAllEvents = (latitude, longitude, tags, distance) => {
  return axios.get('/api/search/location', {
    params: {
      latitude,
      longitude,
      tags,
      distance,
    },
  });
};

export const getAllInRadius = (query, tags = [], distance = 5) => {
  console.log('IN GETALLINRADIUS...searchParams =', tags, distance);
  console.log('IN GETALLINRADIUS...query =', query);
  return function (dispatch) {
    convertAddress(query)
      .then((response) => {
        console.log('GEOCODE RESPONSE : ', response);
        const latitude = response.data.latitude;
        const longitude = response.data.longitude;

        dispatch({
          type: MAP_CENTER,
          payload: { latitude, longitude },
        });
        getAllEvents(latitude, longitude, tags, distance)
          .then((events) => {
            console.log('actions after getAllEvents :', events);
            dispatch({
              type: GET_ALL_EVENTS,
              payload: events.data,
            });
          });
      })
      .catch((err) => {
        if (err) {
          throw err;
        }
      });
    browserHistory.push('home');
  };
};

export const selectEvent = (event) => {
  return {
    type: SELECT_EVENT,
    payload: event,
  };
};


export const createEvent = (props, dishPic) => {
  const targetAddress = props.address + props.city + props.usState;
  return convertAddress(targetAddress)
    .then((payload) => {
      const address = payload.data.address;
      const latitude = payload.data.latitude;
      const longitude = payload.data.longitude;
      const coords = {
        address,
        latitude,
        longitude,
      };
      return coords;
    }).then((coords) => {
      const data = new FormData();
      data.append('file', dishPic[0]);
      const opts = {
        transformRequest() { return data; },
      };
      return axios.post('/api/event/picture', data, opts)
        .then((resp) => {
          const url = resp.data;
          const output = {
            address: coords.address,
            latitude: coords.latitude,
            longitude: coords.longitude,
            url };
          return output;
        })
        .then((output) => {
          const params = {
            eventName: props.eventName,
            description: props.description,
            eventPic: output.url,
            price: props.price,
            maxGuests: props.maxGuest,
            address: output.address,
            latitude: output.latitude,
            longitude: output.longitude,
            startDatetime: props.start,
            endDatetime: props.end,
          };
          return axios.post('/api/event/', params)
            .then(() => {
              browserHistory.push('/');
            })
            .catch((err) => {
              throw err;
            });
        });
    });
};

export const postUserReviewOfChef = (reviewData) => {
  console.log('in post review action :', reviewData);
  return axios.post('/api/review/', reviewData)
    .then((response) => {
      console.log('action review response: ', response);
      return {
        type: POST_USER_REVIEW_OF_CHEF,
        payload: response,
      };
    })
    .catch((err) => {
      if (err) {
        throw err;
      }
    });
};

/** ******************** CHAT **************************/

export const EventIdFunc = (eventId, evName) => {
  const res = { eventId, evName };
  return {
    type: SEND_EVENT_ID,
    payload: res,
  };
};

export const ChatBoxFunc = (status) => {
  return {
    type: CLOSE_CHAT_BOX,
    payload: status,
  };
};


/** ***********Tags*******************/

export const getAllTags = () => {
  console.log('inside getAllTags....');
  return axios.get('/api/tag')
    .then((tags) => {
      console.log('tags=====', tags);
      const restrictions = tags.data.filter(tag => tag.restriction);
      const genres = tags.data.filter(tag => !tag.restriction);
      return function (dispatch) {
        dispatch({
          type: ALL_RESTRICTIONS,
          payload: restrictions,
        });
        dispatch({
          type: ALL_GENRES,
          payload: genres,
        });
      };
    })
    .catch((err) => {
      throw err;
    });
};

import axios from 'axios';
import {
    SET_FORM_FIELDS,
    UPDATE_FORM_FIELD,
    SET_USER_AUTOCOMPLETE,
    FORM_SUCCESS,
    SUBMIT_ERROR,
    TOGGLE_MODAL
} from '../constants';
import Models from '../data';

const updateFormField = (fieldName, value) => {
    return {
        type: UPDATE_FORM_FIELD,
        data: {
            fieldName,
            value
        }
    }
};

const setFormData = (formType, modelName) => {
    const fields = Models[modelName][formType]['fields'];
    const formMetadata = {
        fields,
        modelName,
        formType
    };

    if (formType === 'new') {

        return receiveFormData(formMetadata);
    }
};

const receiveFormData = (data) => {
    return {
        type: SET_FORM_FIELDS,
        data
    }
};

const getUserAutoComplete = (text) => {
    const url = `/api/search/users?text=${text}`;
    const idToken = localStorage.getItem('idToken');

    return async (dispatch) => {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            dispatch(receiveUserAutocomplete(data));
        } catch (e) {
            console.log(e);
        }
    };
};

const receiveUserAutocomplete = (data) => {
    return {
        type: SET_USER_AUTOCOMPLETE,
        data: {
            autocompleteResults: data
        }
    }
};
// write a test for this!
const addUsersToShow = (data) => {
    return (dispatch, getState) => {
        const { form } = getState();
        const { fields } = form;
        const { users } = fields;
        const { value } = users;

        if (value && Array.isArray(value)) {
            const nextValue = [...value, data];
            return dispatch(updateFormField('users', nextValue));
        }

        const firstValue = [data];
        dispatch(updateFormField('users', firstValue));
    }
};

const prepareFormSubmit = () => {
    const idToken = localStorage.getItem('idToken');

    return async (dispatch, getState) => {
        const formUrl = '/api/shows';
        const { form } = getState();
        const { fields } = form;
        const formData = Object.keys(fields).reduce((memo, f) => {
            memo[f] = fields[f].value;
            return memo;
        }, {});

        try {
            const { data } = await axios.post(formUrl, formData, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            if (data.code === 401) {
                console.log(data.message)
                return dispatch(formSubmitError(data.message));
            }

            dispatch(receiveFormResult(data));
            dispatch({
                type: TOGGLE_MODAL,
                data: {
                    showModal: false
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
};

const receiveFormResult = (data) => {
    return {
        type: FORM_SUCCESS,
        data: data
    };
};

const formSubmitError = (message) => {
    return {
        type: SUBMIT_ERROR,
        data: {
            message: message
        }
    };
};

export { prepareFormSubmit, setFormData, updateFormField, getUserAutoComplete, addUsersToShow };

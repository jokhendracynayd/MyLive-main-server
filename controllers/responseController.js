module.exports.setResponse = (res, { success, msg, data }) => {
    let resp = {
        success: success ? success : false,
        msg: msg ? msg : '',
        data: data ? data : {}
    };

    res.json(resp);
}


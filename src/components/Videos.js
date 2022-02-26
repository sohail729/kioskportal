import React, { useState, useEffect, useContext } from 'react';
import styles from '../views/users/gallery/Gallery.module.css';
import { PlayCircleOutline as PlayCircleOutlineIcon, AddCircleOutlineTwoTone, CloseTwoTone } from '@material-ui/icons';
import { MdDeleteForever } from 'react-icons/md';
import { MdAdd } from 'react-icons/md';
import axios from 'axios';
import { Link } from "react-router-dom";
import stylesModal from '../views/users/gallery/ModalVideoUpdate.module.css';
import Loader from 'react-loader-spinner';
import CONSTANTS from '../constants/apiContants';
import { AccountContext } from '../Accounts';


const Videos = ({ videos, userGroup, username }) => {


    const { getSession, logout } = useContext(AccountContext);
    const [userSess, setUserSession] = useState('');
    const [devicesIds, setDeviceIds] = useState([]);
    const { getCurUser } = useContext(AccountContext);

    useEffect(() => {
        getSession()
            .then(session => {
                setUserSession(session);
                const payload = {
                    'type': 'user',
                    'username': session['sub']
                }
                getCurUser(payload)
                    .then(curUserData => {
                        if (Array.isArray(curUserData.result.Item.Device_ids) && curUserData.result.Item.Device_ids.length) {
                            setDeviceIds(curUserData.result.Item.Device_ids);
                        }
                    })
                    .catch(err => {
                        setLoader(false);
                    });
            }).catch(function (err) {
                logout();
                window.location('/');

            });
    }, [getCurUser, getSession, logout]);


    let updateVideoBgColor = (e) => {
        setVideoBgColor(e.target.value)
    }

    let updateVideoOrientation = (e) => {
        setVideoOrientation(e.target.value);
        var getVal = e.target.value;
        if (getVal === "landscape") {
            setOrientationStatus({
                'status': true
            });
        } else {
            setOrientationStatus({
                'status': false
            });
        }

    }

    let updateCaption = (e) => {
        setCaption(e.target.value);
    }


    const [video, setVideoData] = useState({});
    const [device_id, setDeviceId] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    //vidoeData
    const [desc, setDesc] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [videoBgColor, setVideoBgColor] = useState('#000000')
    const [videoOrientation, setVideoOrientation] = useState('portrait')
    const [caption, setCaption] = useState('off')
    const [orientationStatus, setOrientationStatus] = useState({
        "status": false
    });


    const [dispalyModal, setState] = useState({
        "videoUpdate": 1
    });
    const [loader, setLoader] = useState('');

    const splitUrl = (url) => {
        var domain = url.split('/');
        return domain[domain.length - 2];
    }


    const getSingleVideoData = async (payload) =>
        await new Promise((resolve, reject) => {
            axios.post('https://4uzxj5hhqc.execute-api.us-east-1.amazonaws.com/get_data_stage', payload, { headers: CONSTANTS.headers })
                .then(function (response) {
                    if (response.status === 200) {
                        if (response.data.statusCode === 200) {
                            resolve(response.data);
                        } else if (response.data.statusCode === 400) {
                            reject(response.data.message)
                        } else if (response.data.errorMessage) {
                            reject('Something went wrong!');
                            console.error(response);
                        }
                    }
                })
                .catch(function (error) {
                    reject(error.KeyError)
                });
        });

    const getVideo = (e, item, index) => {
        e.preventDefault()
        setSuccessMsg('')
        getSingleVideoData({ 'type': 'singleVideo', 'username': userSess.accessToken.payload.sub, 'index': item.id })
            .then(data => {
                setVideoData(data)
                setImageUrl(data.result.image_url);
                setVideoUrl(data.result.video_url);
                setDesc(data.result.description);
                setState({
                    'videoUpdate': 2
                });
            })
            .catch(err => {
                setLoader(false);
            })
    }

    const getFeaturedVideo = (e) => {
        e.preventDefault();
        setLoader(true);
        const videoObj = {
            'imageUrl': imageUrl,
            'videoUrl': videoUrl,
            'desc': desc,
            'bg': videoBgColor,
            'device_id': device_id,
            'caption': caption,
            'type': 'update_video',
            'orientation': videoOrientation
        }

        axios.post('https://p0kh5gi7wi.execute-api.us-east-1.amazonaws.com/update_stage', videoObj)
            .then(function (response) {
                if (response.status === 200) {
                    if (response.data.statusCode === 200) {
                        setSuccessMsg(response.data.message)
                        sendPushNotification(device_id);
                        setState({
                            'videoUpdate': 1
                        });
                    } else if (response.data.statusCode === 400) {
                    } else if (response.data.errorMessage) {
                    }
                }
                setLoader(false);
            })

    }

    const chooseDevice = (e, device_id) => {
        e.preventDefault();
        setDeviceId(device_id)

    }

    const sendPushNotification = (device_id) => {
        const payload = {
            'device_id': device_id
        }
        axios.post('https://3a9zpk6kwd.execute-api.us-east-1.amazonaws.com/pusher_stage', payload)
            .then(function (response) {

            })
            .catch(function (error) {
            });
    }

    const ClostIt = () => {
        setState({
            'videoUpdate': 0
        });
    }
    const closeVideoUpdate = (e) => {
        e.preventDefault()
        setState({
            'videoUpdate': 3
        });
    }

    const addDevice = (e) => {
        e.preventDefault()
        setState({
            'videoUpdate': 1
        });
    }

    const deleteVideo = async (e, item, index) => {
        if (window.confirm("Are you sure?") === true) {
            e.preventDefault()
            const payload = {
                'index': index,
                'username': username,
                'type': 'delete_video'
            }
            await axios.post('https://f6ahlupmxi.execute-api.us-east-1.amazonaws.com/delete_video_stage', payload)
                .then(function (response) {
                    setLoader(true);
                    window.location.reload();

                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }


    return (
        <div>
            {
                userGroup !== 'admin_group' && dispalyModal.videoUpdate === 1 ?
                    <div className="modal modal-videoUpdate fade show" tabIndex="-1" style={{ display: 'block' }}>
                        <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Step 1: Select Device</h5>
                                    <a href="/users/verify/device" title="Add New Device"><AddCircleOutlineTwoTone style={{ color: "#093171", fontSize: 35 }} /> </a>

                                    
                                    <button onClick={(e) => closeVideoUpdate(e)} title="Close" style={{ background: "transparent", border: 0 }}><CloseTwoTone style={{ color: "#093171", fontSize: 35 }} /> </button>
                                </div>
                                <div className="modal-body">
                                    <div className="col-md-12">
                                        <select defaultValue={device_id} className="form-control" onChange={(e) => chooseDevice(e, e.target.value)}>
                                            <option value="" hidden>Select Device ID</option>
                                            {
                                                devicesIds.length > 0 ?
                                                    devicesIds.map((item, index) => (
                                                        <option value={item} key={index}>{item}</option>
                                                    ))
                                                    : ''
                                            }
                                        </select>
                                    </div>
                                    <div className="mt-2 col-md-12">
                                        <div className="form-group">
                                            {
                                                (device_id === '')
                                                    ? <button className="btn btn-primary w-100" disabled>Please select device ID</button>
                                                    : <button onClick={ClostIt} className="btn btn-primary w-100">Step 2: Select Video from Gallery</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    :

                    ''

            }

            {
                userGroup !== 'admin_group' && dispalyModal.videoUpdate === 2 ?
                    <div className="modal modal-videoUpdate fade show" tabIndex="-1" style={{ display: 'block' }}>
                        <div className="modal-dialog  modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Step 3: Update Video</h5>
                                    <button onClick={ClostIt} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">✖</button>

                                </div>
                                <div className="modal-body">
                                    <p className="">Device: {device_id}</p>
                                    {successMsg ? <div className="alert alert-success">{successMsg}</div> : ''}
                                    {successMsg ? <div className="alert text-info">{'Public URL: '}

                                        <Link className="tc" to={'/play/v/' + device_id} target="_blank">
                                            {window.location.origin + '/play/v/' + device_id}
                                        </Link></div> : ''}

                                    <div className={(orientationStatus.status === true ? 'landscape' : 'portrait') + " videoModalUpdate"} >

                                        <div className={styles.posrel + " video text-center"}>
                                            <div className={styles.modalVideoEdit_video}>
                                                <img src={(video.result.image_url.indexOf('google.com') !== -1) ? 'https://drive.google.com/uc?export=view&id=' + splitUrl(video.result.image_url) : video.result.image_url} width="60%" alt="" />
                                                <PlayCircleOutlineIcon className={styles.svgIcon}
                                                    style={{ color: "#fff", fontSize: 40 }} />
                                            </div>
                                        </div>

                                        <form onSubmit={(e) => getFeaturedVideo(e)}>
                                            <div className={stylesModal.cont}>
                                                <div className={stylesModal.videoModalInfo + " form-group"}>
                                                    <label className={stylesModal.videoModalLabel} htmlFor="bgColor">BG Color</label>
                                                    <input className="form-control p-0" id="bgColor" type="color"
                                                        value={videoBgColor}
                                                        onChange={updateVideoBgColor}
                                                    />
                                                </div>

                                                <div className="orientation__radio form-group">
                                                    <label className={stylesModal.videoModalLabel} htmlFor="bgColor">Orientation</label>
                                                    {orientationStatus.status === false ?
                                                        <label className="mr-2">
                                                            <input
                                                                type="radio"
                                                                value="portrait"
                                                                checked={(videoOrientation === 'portrait') + "checked"}
                                                                onChange={updateVideoOrientation}
                                                            />
                                                            <span>Portrait</span>
                                                        </label>
                                                        :
                                                        <label className="mr-2">
                                                            <input
                                                                type="radio"
                                                                value="portrait"
                                                                checked={(videoOrientation === 'portrait')}
                                                                onChange={updateVideoOrientation}
                                                            />
                                                            <span>Portrait</span>
                                                        </label>
                                                    }

                                                    <label>
                                                        <input
                                                            type="radio"
                                                            value="landscape"
                                                            checked={videoOrientation === 'landscape'}
                                                            onChange={updateVideoOrientation}
                                                        />
                                                        <span>Landscape</span>
                                                    </label>
                                                </div>
                                                <div className="orientation__radio form-group">
                                                    <label className={stylesModal.videoModalLabel} htmlFor="bgColor">Caption</label>
                                                    <label className="mr-2">
                                                        <input

                                                            type="radio"
                                                            value="on"
                                                            checked={(caption === 'on')}
                                                            onChange={updateCaption}
                                                        />
                                                        <span>On</span>
                                                    </label>

                                                    <label>
                                                        <input

                                                            type="radio"
                                                            value="off"
                                                            checked={caption === 'off'}
                                                            onChange={updateCaption}
                                                        />
                                                        <span>Off</span>
                                                    </label>
                                                </div>
                                                <div className={stylesModal.videoModalInfo + " form-group"}>
                                                    <label className={stylesModal.videoModalLabel} htmlFor="bgColor">Description</label>
                                                    <textarea className="form-control" id="desc"
                                                        value={desc}
                                                        readOnly
                                                    />
                                                </div>

                                            </div>
                                            <div className="form-group">
                                                {
                                                    (device_id === '')
                                                        ? <button className="btn btn-primary w-100" disabled>Please select device ID</button>
                                                        : <button className="btn btn-primary w-100">Play Video</button>
                                                }
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    ''
            }
            <div className='row m-0'>
                {
                    userGroup !== 'admin_group' ?
                        <div className="col-md-12 listing__action">
                            <div className="row">
                                <button className={"btn btn-primary ml-auto " + styles.btn_add_user}
                                    onClick={(e) => addDevice(e)}>
                                    <MdAdd size="18" />
                                    <span>
                                        Select Device
                                    </span>
                                </button>
                            </div>
                        </div> : ''
                }
                <div className='col-md-12 video-wrapper mt-3 p-0'>
                    {loader ? <Loader className="loader" type="ThreeDots" color="#093171" height="100" width="100" style={{ zIndex: "1" }} /> : ''}
                    {
                        videos.length > 0 ?
                            videos.map((item, index) => (

                                <div onClick={dispalyModal.videoUpdate === 0 ? (e) => getVideo(e, item, index) : () => void 0} className={styles.videobox} key={index}>
                                    {
                                        userGroup === 'admin_group' ?
                                            <button onClick={(e) => deleteVideo(e, item, index)} className="btn btn-sm btn-danger" style={{ padding: 0, width: '100%' }}><MdDeleteForever fill="#ffffff" style={{ fontSize: 26 }} /> </button>
                                            : ''}

                                    <div className={styles.videobox__img}>
                                        <img src={(item.image_url.indexOf('google.com') !== -1) ? 'https://drive.google.com/uc?export=view&id=' + splitUrl(item.image_url) : item.image_url} alt="" />
                                        <PlayCircleOutlineIcon className={styles.svgIcon}
                                            style={{ color: "#fff", fontSize: 40 }} />

                                    </div>
                                    <div className={styles.videobox__cont}>
                                        {item.description}
                                    </div>
                                </div>
                            ))
                            : <p className="noData">No Data Found</p>
                    }
                </div>
            </div>
        </div>
    );
};

export default Videos;
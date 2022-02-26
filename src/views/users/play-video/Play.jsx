import React, { useState, useEffect } from 'react';
import { withRouter, useParams } from "react-router-dom";


import axios from 'axios';

import Pusher from 'pusher-js';

function Play(props) {

    const key = useParams();
    const [video, setVideo] = useState('');
    const [bg, setBg] = useState('');
    const [orientation, setOrientation] = useState('');
    const [desc, setDesc] = useState('');
    const [caption, setCaption] = useState('');
    const [videoType, setVideoType] = useState(0);

    useEffect(() => {
        var pusher = new Pusher('07910449c883e247d2e7', {
            cluster: 'us3'
        });

        var channel = pusher.subscribe('wooden-bread-108');
        channel.bind('test-event', function (data) {
            if (key.deviceId === data['device_id']) {
                window.location.reload();
            }
        });

        getSingleVideoData({ 'type': 'checFeatureVideo', 'device_id': key.deviceId })
            .then(data => {
                setVideo(data.result.videoUrl)
                setDesc(data.result.desc);
                setBg(data.result.bg);
                setCaption(data.result.caption);
                setOrientation(data.result.orientation);
                if (data.result.videoUrl.indexOf('google.com') !== -1) {
                    setVideoType(1)
                } else if (data.result.videoUrl.indexOf('googleapis.com') !== -1) {
                    setVideoType(2)
                }
            })
            .catch(err => {
                console.error(err);
            })
    }, [key.deviceId])

    const getSingleVideoData = async (payload) =>
        await new Promise((resolve, reject) => {
            axios.post('https://4uzxj5hhqc.execute-api.us-east-1.amazonaws.com/get_data_stage', payload)
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


    const splitUrl = (url) => {
        var domain = url.split('/');
        return domain[domain.length - 2];
    }

    return (
        <div style={{ "minWidth": "100%", "height": "100%", "backgroundColor": bg }} >
            {
                video ?
                    <div>
                        {
                            caption === 'on' ?
                                <h4 style={
                                    orientation === 'landscape' ?
                                        {
                                            "position": "absolute",
                                            "background": "rgba(0,0,0,.5)",
                                            "transform": "rotate(90deg) translate(0, -100%)",
                                            "transformOrigin": "left top",
                                            "zIndex": "999",
                                            "padding": "10px 0",
                                            "margin": "0",
                                            "fontSize": "32px",
                                            "width": "100vh",
                                            "textAlign": "center",
                                            "color": "#fff",
                                            "overflow": "hidden",
                                            "transition": "max-height 0.5s, overflow 0.5s 0.5s",
                                            "left": "0",
                                            "right": "0",
                                        }
                                        :
                                        {
                                            "position": "absolute",
                                            "color": "#fff",
                                            "bottom": "0",
                                            "fontSize": "32px",
                                            "background": "rgba(0,0,0,0.5)",
                                            "padding": "10px 0",
                                            "margin": "0",
                                            "width": "100%",
                                            "textAlign": "center",
                                            "overflow": "hidden",
                                            "transition": "max-height 0.5s, overflow 0.5s 0.5s",
                                            "left": "0",
                                            "right": "0",
                                        }
                                } >{desc}</h4>
                                : ''
                        }
                    </div>
                    : ''

            }
            {
                video ?
                    <video style={
                        orientation === 'landscape' ?
                            {
                                "position": "absolute",
                                "transform": "rotate(90deg)",
                                "transformOrigin": "bottom left",
                                "width": "100vh",
                                "height": "100vw",
                                "marginTop": "-100vw",
                                "objectFit": "contain",
                                "zIndex": "4",
                                "background": bg,
                                "visibility": "visible"
                            }
                            :
                            {
                                "background": bg,
                                "display": "block",
                                "margin": "0 auto",
                                "width": "100%",
                                "height": "100%",
                                "maxHeight": "100%",
                                "maxWidth": "100%"
                            }
                    } controls loop id="videoId" allow="autoplay" autoPlay="1" muted playsInline >
                        {
                            videoType === 1 ?
                                <source src={'https://drive.google.com/uc?export=view&id=' + splitUrl(video)} type="video/mp4" >
                                </source>
                                :
                                <source src={video} type="video/mp4" >
                                </source>
                        }
                        <label htmlFor="videoId">
                            Your browser does not support the video tag.
                        </label>
                    </video>

                    : ''
            }
        </div>
    )
}

export default withRouter(Play);
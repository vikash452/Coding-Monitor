import { useState, useEffect } from 'react'
import { useHistory } from 'react-router';
import M from 'materialize-css'
import CanvasJSReact from '../assets/canvasjs.react'
import './design.css';
import BlobbyButton from '../assets/BlobbyButton'
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

function comparator(a,b)
{
    return a.x-b.x;
}

function Compare() {
    const [friendList, setFriendList] = useState([])
    const [friendhandle, setFriendHandle] = useState('');
    const [userHandle, setUserhandle] = useState('');
    const [content_1, setContent_1] = useState(null)
    const [content_2, setContent_2] = useState(null)
    const [visible1, setVisible1] = useState(false)
    const [rating1, setRating1] = useState([])
    const [rating2, setRating2] = useState([])
    const [usrsubms, setUserSubms] = useState([])
    const [frndsubms, setFrndSubms] = useState([])
    const [userQuestionRating , setUserQuestionRating]=useState([])
    const [friendQuestionRating , setFriendQuestionRating]=useState([])

    const history = useHistory()

    useEffect(() => {

        var user = JSON.parse(localStorage.getItem('user'))
        if (!user) {
            history.push('/profile')
        }

        setUserhandle(user.codeforces)
        // console.log(user.codeforces)
        fetch('/user/getFriendList', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
        })
            .then(res => res.json())
            .then((data) => {
                // console.log(data)
                setFriendList(data.friends)
            })
            .catch(err => {
                console.log(err)
            })

    }, [])

    function getRatingChange_user() {
        // console.log(userHandle)
        var list = []
        fetch(`https://codeforces.com/api/user.rating?handle=${userHandle}`)
            .then(res => res.json())
            .then((data) => {
                // data.result.reverse()
                data.result.forEach((element) => {
                    var temp_object = {
                        x: new Date(element.ratingUpdateTimeSeconds * 1000),
                        y: element.newRating
                    }
                    list.push(temp_object)
                })
                // console.log(list)
                setRating1(list)
            })
    }

    function getRatingChange_friend() {
        var list = []
        fetch(`https://codeforces.com/api/user.rating?handle=${friendhandle}`)
            .then(res => res.json())
            .then((data) => {
                // data.result.reverse()
                data.result.forEach((element) => {
                    // console.log(typeof(element.newRating))
                    var temp_object = {
                        x: new Date(element.ratingUpdateTimeSeconds * 1000),
                        y: element.newRating
                    }
                    list.push(temp_object)
                })
                // console.log(list)
                setRating2(list)
            })
    }

    // IS FUNCTION TO FILL KRNA HAI
    function getSubmissionStats(handle_to_find) {
        var accepted = 0;
        var wrong_answer = 0;
        var tle = 0;
        var memory_limit = 0;
        var runtime_error = 0;
        //IN VARIABLES KI VALUE FILL KRWA DIO
        //BAAKI RETURN ME KRWA DUNGA EK OBJECT BNA KE
        //IS PAGE KI FORMATTING BHUT DHYAAN SE KRNI HOGI
        //CANVAS BHUT ERROR DE RHA THA
        //********HANDLE WITH CARE****************//
        var acceptedSet = new Set()
        var rating_wise_submissions=new Map()
        fetch(`https://codeforces.com/api/user.status?handle=${handle_to_find}&from=1`)
            .then(response => response.json())
            .then((data) => {
                //console.log(data.result);
                data.result.forEach((element) => {
                    var unique = element.problem.contestId.toString() + element.problem.index
                    if (element.verdict === "OK" && !acceptedSet.has(unique)) {
                        ++accepted;
                        // console.log(element)
                        acceptedSet.add(unique)
                        var questionRating=element.problem.rating;
                        if(rating_wise_submissions.has(questionRating))
                        {
                            rating_wise_submissions.set(questionRating , rating_wise_submissions.get(questionRating) + 1)
                        }
                        else
                        {
                            rating_wise_submissions.set(questionRating,1);
                        }

                    }
                    if (element.verdict === "TIME_LIMIT_EXCEEDED")
                        tle += 1;
                    if (element.verdict === "WRONG_ANSWER")
                        wrong_answer += 1;
                    if (element.verdict === "MEMORY_LIMIT_EXCEEDED")
                        memory_limit += 1;
                    if (element.verdict === "RUNTIME_ERROR")
                        runtime_error += 1;
                })
                //console.log(accepted, tle, wrong_answer, memory_limit, runtime_error);
                let subms = [];
                subms.push({ label: "Accepted", y: accepted });
                subms.push({ label: "Wrong Answer", y: wrong_answer });
                subms.push({ label: "Time Limit Exceeded", y: tle });
                subms.push({ label: "Memory Limit Exceeded", y: memory_limit });
                subms.push({ label: "Runtime Error", y: runtime_error });

                // console.table(subms);

                var list_rating_wise_submissions=[]
                const iterator=rating_wise_submissions[Symbol.iterator]();
                for(const item of iterator)
                {
                    if(item[0] != undefined && item[1] != undefined)
                    {
                        var temp_object={
                            x:item[0],
                            y:item[1]
                        }
                        list_rating_wise_submissions.push(temp_object)
                    }
                    
                }
                
                list_rating_wise_submissions.sort(comparator)
                // console.log(list_rating_wise_submissions)
                if (handle_to_find === userHandle) {
                    setUserSubms(subms);
                    setUserQuestionRating(list_rating_wise_submissions)
                }
                else {
                    setFrndSubms(subms);
                    setFriendQuestionRating(list_rating_wise_submissions)
                }
                // console.log(rating_wise_submissions)
                
            })
    }

    function Compare() {
        //USER DETAILS
        fetch(`https://codeforces.com/api/user.info?handles=${userHandle};${friendhandle}`)
            .then(res => res.json())
            .then((data) => {
                // console.log(data.result[0])
                // console.log(data.result[1])
                setContent_1(data.result[0])
                setContent_2(data.result[1])
            })
        getRatingChange_user()
        getRatingChange_friend()
        getSubmissionStats(userHandle)
        // setContent_1({   
        //     ...content_1,
        //     accepted:stats.accepted,
        // })
        getSubmissionStats(friendhandle)
        // stats=getSubmissionStats(userHandle)
        // setContent_2({
        //     ...content_2,
        //     stats
        // })
        setVisible1(true)

    }

    function TotalSubmissionsData() {
        if (usrsubms.length > 0 && frndsubms.length > 0) {
            // return (
            // console.log(usrsubms[0])
            // console.log(frndsubms[0])
            // )
        }
    }

    // useEffect(() => {
    //     console.log(friendList)
    // }, [friendList])

    return (
        <div className="compare-div" style={{ marginBottom: visible1 ? '100px' : '285px' }}>
            
            <div className="content">
                {/* style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}> */}
                <span><h4>Compare Yourself With</h4></span>
                <select
                    // style={{ maxWidth: 'fit-content' }}
                    className='browser-default' onChange={(e) => { 
                         
                        // console.log(e.target.text)
                    }}

                    onClick={(e)=>{
                        setFriendHandle(e.target.value)
                        // console.log(e.target.value)
                    }}

                    >

                    {
                        friendList.map((item) => {    //MATERIALIZE SELECT NOT WORKING
                            // console.log(item.codeforces)
                            return (
                                <option key={item.email} value={item.codeforces}>{item.codeforces}</option>
                            )
                        })

                    }
                </select>
                <h5>OR</h5>
                <input type='text' onChange={(e) => { setFriendHandle(e.target.value) }} 
                // style={{ maxWidth: 'fit-content' }}
                 />
                <button className="blobby-button" onClick={() => {
                    // console.log(friendhandle)
                    Compare()
                }}>Compare
                    <BlobbyButton/>
                </button>
            </div>
            
            <div className='compareTable'>
                {
                    (content_1 && content_2)
                        ?
                        <table>
                            <thead>
                                <tr>
                                    <td style={{ textAlign: 'center' }}>
                                        <img src={content_1.titlePhoto} style={{ width: '100px', height: '100px' }} />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <img src={content_2.titlePhoto} style={{ width: '100px', height: '100px' }} />
                                    </td>
                                </tr>

                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {content_1.handle}
                                    </td>
                                    <td>
                                        {content_2.handle}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {content_1.rank} {content_1.rating}
                                    </td>
                                    <td>
                                        {content_2.rank} {content_2.rating}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        max rating : {content_1.maxRating} , {content_1.maxRank}
                                </td>
                                    <td>
                                        max rating : {content_2.maxRating} , {content_2.maxRank}
                                </td>
                                </tr>
                                <tr>
                                    <td>
                                        Total Questions:
                                    {
                                            usrsubms.length ? usrsubms[0].y : 0
                                        }
                                    </td>
                                    <td>
                                        Total Questions:
                                    {
                                            frndsubms.length ? frndsubms[0].y : 0
                                        }
                                    </td>
                                </tr>
                            </tbody>

                        </table>

                        :
                        <></>
                }
            </div>

            <div style={{ marginLeft: '10px', marginRight: '10px' }}>
                {
                    visible1
                        ?
                        <CanvasJSChart options={

                            {
                                animationEnabled: true,
                                theme: "light2",
                                zoomEnabled: true,
                                backgroundColor: 'rgba(0,0,0,0)',
                                lineColor: 'White',
                                title: {
                                    text: "Your rating change",
                                    fontSize: 30,
                                    fontColor: "White",
                                    fontFamily: "Helvetica",
                                    horizontalAlign: "center",
                                    padding: 5,
                                },
                                axisX: {
                                    title: "Date",
                                    // reversed: true,
                                    labelAutoFit: true,
                                    labelFontSize: 15,
                                    labelFontColor: 'White',
                                    titleFontColor: 'White',
                                    lineColor: 'White',
                                },
                                axisY: {
                                    title: "Rating",
                                    labelAutoFit: true,
                                    labelFontSize: 15,
                                    labelFontColor: 'White',
                                    titleFontColor: 'White',
                                    lineColor: 'White',
                                },
                                height: 500,
                                // width:1000,
                                legend: {
                                    fontColor: 'White'
                                },
                                data: [
                                    {
                                        type: "spline",
                                        // markerSize:0,
                                        showInLegend: true,
                                        legendText: `${userHandle}`,
                                        dataPoints: rating1,
                                        // lineColor:'White'
                                    },
                                    {
                                        type: "spline",
                                        // markerSize:0,
                                        showInLegend: true,
                                        legendText: `${friendhandle}`,
                                        dataPoints: rating2,
                                        // lineColor:'White'
                                    }
                                ]
                            }
                        }
                        />
                        :
                        <></>
                }
            </div>
            <div style={{ marginTop: '5rem', marginRight: '15px', marginLeft: '15px' }}>
                {
                    (usrsubms.length > 0 && frndsubms.length > 0)
                        ?
                        <CanvasJSChart options={

                            {
                                animationEnabled: true,
                                theme: "light2",
                                backgroundColor: 'rgba(0,0,0,0)',
                                lineColor: 'White',
                                title: {
                                    text: "Your submission profile",
                                    fontSize: 30,
                                    fontColor: "White",
                                    fontFamily: "Helvetica",
                                    horizontalAlign: "center",
                                    padding: 5,
                                },
                                axisX: {
                                    title: "Date",
                                    // reversed: true,
                                    labelAutoFit: true,
                                    labelFontSize: 15,
                                    labelFontColor: 'White',
                                    titleFontColor: 'White',
                                    lineColor: 'White',
                                },
                                axisY: {
                                    title: "Number of questions",
                                    labelAutoFit: true,
                                    labelFontSize: 15,
                                    labelFontColor: 'White',
                                    titleFontColor: 'White',
                                    lineColor: 'White',
                                },
                                height: 500,
                                // width:1000,
                                legend: {
                                    fontColor: 'White'
                                },
                                data: [
                                    {
                                        type: "column",
                                        // markerSize:0,
                                        showInLegend: true,
                                        legendText: `${userHandle}`,
                                        dataPoints: usrsubms,
                                        // lineColor:'White'
                                    },
                                    {
                                        type: "column",
                                        // markerSize:0,
                                        showInLegend: true,
                                        legendText: `${friendhandle}`,
                                        dataPoints: frndsubms,
                                        // lineColor:'White'
                                    }
                                ]
                            }
                        }
                        />
                        :
                        <>
                        </>


                }
            </div>
            <div style={{ marginTop: '5rem', marginRight: '15px', marginLeft: '15px' }}>
                {
                    (userQuestionRating.length > 0 && friendQuestionRating.length > 0)
                        ?
                        <CanvasJSChart options={

                            {
                                animationEnabled: true,
                                theme: "light2",
                                backgroundColor: 'rgba(0,0,0,0)',
                                lineColor: 'White',
                                title: {
                                    text: "Rating wise question submissions",
                                    fontSize: 30,
                                    fontColor: "White",
                                    fontFamily: "Helvetica",
                                    horizontalAlign: "center",
                                    padding: 5,
                                },
                                axisX: {
                                    title: "Date",
                                    // reversed: true,
                                    labelAutoFit: true,
                                    labelFontSize: 15,
                                    labelFontColor: 'White',
                                    titleFontColor: 'White',
                                    lineColor: 'White',
                                },
                                axisY: {
                                    title: "Number of questions",
                                    labelAutoFit: true,
                                    labelFontSize: 15,
                                    labelFontColor: 'White',
                                    titleFontColor: 'White',
                                    lineColor: 'White',
                                },
                                height: 500,
                                // width:1000,
                                legend: {
                                    fontColor: 'White'
                                },
                                data: [
                                    {
                                        type: "column",
                                        // markerSize:0,
                                        showInLegend: true,
                                        legendText: `${userHandle}`,
                                        dataPoints: userQuestionRating,
                                        // lineColor:'White'
                                    },
                                    {
                                        type: "column",
                                        // markerSize:0,
                                        showInLegend: true,
                                        legendText: `${friendhandle}`,
                                        dataPoints: friendQuestionRating,
                                        // lineColor:'White'
                                    }
                                ]
                            }
                        }
                        />
                        :
                        <>
                        </>


                }
            </div>
        </div>
    )
}

export default Compare;
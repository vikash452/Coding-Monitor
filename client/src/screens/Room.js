import { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import './design.css'
import M from 'materialize-css'
import BlobbyButton from '../assets/BlobbyButton';
// import Background from '../images/img2.png'


function compare(a, b) {
    return a.result.problem.rating - b.result.problem.rating;
}

function randomize(a, b) {
    // var x=Math.floor(new Date()/1000);
    // if(x%10 == 0)
    // return 0;
    // else if(x%2 == 0)
    return 1;
    // else
    // return -1;
}

function Room() {
    var temp_2d = new Array

    const history = useHistory();
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState('');
    const [participants, setParticipants] = useState([])
    // var participants=[]
    const [questionList, setQuestionList] = useState([])
    const [q2, setQ2] = useState([])
    var startTime, endTime;
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [contestStarted, setContestStarted] = useState(false)
    const [scores, setscores] = useState([]);
    const [questions_loaded_percentage, setQuestionsPercentage] = useState(0.0)
    const [resultCard, setResultCard] = useState([])
    const [start_timings, set_Start_timings] = useState(0)
    const [initialRating, setInitialRating] = useState(800)
    const [inRoom, setInRoom] = useState(false);
    var IR;
    var isAdmin = false;
    var user;
    // var initialRating=800;

    useEffect(() => {
        // console.log(Math.floor(new Date()/1000))

        user = JSON.parse(localStorage.getItem('user'))
        fetch(`/contest/roomDetails/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
        })
            .then(res => res.json())
            .then((data) => {
                if (data.error) {
                    alert('no such room exists')
                    history.push('/home')
                }
                else {
                    setRoomName(data.name)

                    setParticipants(data.participants)
                    setInitialRating(data.initialRating)
                    console.log(data.initialRating)
                    IR = data.initialRating
                    // console.log(initialRating)

                    if (user.email == data.adminEmail)
                        isAdmin = true

                    startTime = new Date(data.startTiming).getTime()
                    endTime = new Date(data.endTiming).getTime()
                    set_Start_timings(data.startTiming)

                    var clock = setInterval(() => {
                        var now = new Date().getTime();
                        var diff = Math.floor((startTime - now) / 1000);
                        var s = diff % 60;
                        var min = Math.floor(diff / 60) % 60;
                        var hrs = Math.floor(diff / (60 * 60)) % 60;

                        if (hrs < 0 && min < 0 && s < 0) {
                            setContestStarted(true)
                            clearInterval(clock)
                            if (inRoom) {
                                M.toast({
                                    html: 'Contest started',
                                    classes: "#ce93d8 purple",
                                    displayLength: 5000,
                                })
                            }

                            StartContest(true)
                        }
                        else {
                            setSeconds(s)
                            setMinutes(min)
                            setHours(hrs)
                        }
                    }, 1000)
                }

            })
            .catch((err) => {
                console.log(err)
            })




    }, [initialRating])

    function scoreboard_sort_comparator(a, b) {
        console.log(a, b)
        return a.score - b.score
    }

    function Scoreboard() {

        var total_questions = 5;
        var total_participants = participants.length;
        var score_card = new Array(total_participants);
        for (var i = 0; i < total_participants; ++i) {
            score_card[i] = new Array(total_questions);      // 5 because we are giving 5 questions
            for (var j = 0; j < total_questions; ++j) {
                score_card[i][j] = 0;
            }
        }
        // console.log()

        var handles = [];
        var rank_calculator = []

        participants.forEach(part => {
            handles.push(part.codeforces)
        })

        var questions_map = new Map();
        questionList.forEach((ques, index) => {
            var id = ques.contestId.toString() + ques.index
            questions_map.set(id, index);
        })
        // console.log(questions_map)

        function Order_Scoreboard() {
            var sorter = []
            for (var i = 0; i < total_participants; ++i) {
                var obj = {
                    // score:score_card[i][0]+score_card[i][1]+score_card[i][2]+score_card[i][3]+score_card[i][4],
                    score: rank_calculator[i],
                    participant_data: participants[i],
                    score_line: score_card[i]
                }
                sorter.push(obj)
            }
            // console.log(sorter)
            sorter.sort(scoreboard_sort_comparator)
            var new_participants_list = []

            for (var i = 0; i < total_participants; ++i) {
                new_participants_list.push(sorter[i].participant_data)
                score_card[i] = sorter[i].score_line
            }

            setParticipants(new_participants_list)

            console.log(sorter)
        }
        rank_calculator = [0, 0, 0, 0, 0];
        FillHandles(0)

        function FillHandles(index) {
            if (index >= total_participants) {
                console.log(rank_calculator)
                Order_Scoreboard()
                setResultCard(score_card)
                // // resultCard=score_card
                // console.log(resultCard)
                // console.log('stopping')
                return;
            }

            fetch(`https://codeforces.com/api/user.status?handle=${handles[index]}&from=1&count=100`)
                .then(res => res.json())
                .then((data) => {
                    data.result.forEach((item) => {
                        var id = item.problem.contestId.toString() + item.problem.index;
                        if (questions_map.has(id)) {
                            var questionIndex = questions_map.get(id);
                            // console.log(questionIndex)

                            if (score_card[index][questionIndex] == -1 || score_card[index][questionIndex] == 0) {
                                if (item.verdict === 'OK') {
                                    var x = Math.floor(new Date(start_timings) / 1000)
                                    var y = item.creationTimeSeconds
                                    // console.log(y)
                                    var min = (Math.floor((y - x) / (60)));
                                    var hrs = Math.floor(min / 60)
                                    // score_card[index][questionIndex] = hrs + ':' + (min%60);
                                    score_card[index][questionIndex] = y - x;
                                    var diff = Math.floor((y - x) / 60)
                                    console.log(diff)
                                    console.log(typeof (questionList[questionIndex].rating))
                                    if (diff > 10) {
                                        rank_calculator[index] += ((questionList[questionIndex].rating) - diff * 5)
                                    }
                                    else {
                                        rank_calculator[index] += (questionList[questionIndex].rating)
                                    }
                                }
                                else {
                                    score_card[index][questionIndex] = -1;
                                }
                            }
                        }
                    })
                    FillHandles(index + 1)
                })
        }
    }

    function FillHandles(index, nmap, handles, totalParticipants) {
        if (index >= totalParticipants) {
            GetProblems(nmap)
            return;
        }

        var limit = Math.min(totalParticipants - index, 4);
        var calls = 0;

        fetch(`https://codeforces.com/api/user.status?handle=${handles[index]}`)
            .then(response => response.json())
            .then(data => {
                data.result.forEach(function (element) {
                    let id = element.problem.contestId.toString() + element.problem.index;
                    // if( element.verdict === "OK")
                    nmap.set(id, true);
                })
                ++index
                setQuestionsPercentage(Math.trunc((index / (totalParticipants + 1)) * 100))
                FillHandles(index, nmap, handles, totalParticipants);
            })
        // setInterval(()=>{

        // },21)

    }

    function GetProblems(nmap) {
        // console.log('get problems called')
        let arr = [];
        let k = IR;
        console.log(k)
        fetch(`https://codeforces.com/api/problemset.problems`)
            .then(response => response.json())
            .then(data => {
                //console.log(data);
                data.result.problems.sort(randomize);
                //console.table(data.result.problems);
                var total = 0;
                data.result.problems.forEach(function (element) {
                    let id = element.contestId.toString() + element.index;
                    let flag = true;

                    element.tags.forEach(function (element2) {
                        if (element2 === "special problem") {
                            flag = false;
                        }
                    })
                    if (flag === true && nmap.get(id) != true && element.rating == k && total <= 5) {
                        console.log(element)
                        // arr[i] = element;
                        arr.push(element)
                        // i += 1;
                        k += 100;
                        ++total;
                    }
                });

                // setQ2(questionList)
                setQuestionList(arr)
                // console.log(new Date().toUTCString())
                // console.log(questionList);
            })
    }

    function FilterProblems(participants_array) {
        let i = 0;
        let nmap = new Map();
        // let handles = ['umanggupta001122', 'Marcos_0901', 'Lord_Invincible', 'shantys502', 'DLN','mexomerf','jainanshika193'];
        let handles = []
        participants_array.forEach((part) => {
            handles.push(part.codeforces)
        })
        // console.log(handles)

        var totalParticipants = handles.length;

        FillHandles(0, nmap, handles, totalParticipants)

    }

    function Refresh(contestStarted) {
        fetch(`/contest/roomDetails/${roomId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
        })
            .then(res => res.json())
            .then((data) => {
                if (data.error) {
                    alert('no such room exists')
                    history.push('/home')
                }
                else {
                    setRoomName(data.name)
                    setParticipants(data.participants)
                    // initialRating=data.initialRating;
                    // setInitialRating(data.initialRating)
                    if (contestStarted) {
                        // GetProblems(data.participants);
                        // console.log(new Date().toUTCString())
                        FilterProblems(data.participants)
                    }
                }

            })
            .catch((err) => {
                console.log(err)
            })
    }

    function LeaveRoom() {
        fetch(`/contest/leaveRoom/${roomId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwt')
            }
        })
            .then(res => res.json())
            .then((data) => {
                // console.log(data)
                if (data.error) {
                    M.toast({
                        html: data.error,
                        classes: "#ce93d8 purple",
                        displayLength: 1000,
                    })
                }
                else {
                    history.push('/home')
                }

            })
            .catch((err) => {
                console.log(err)
            })
    }

    function StartContest(contestStarted) {
        Refresh(true)
        // GetProblems()
        // var now=new Date().getTime();
        var deadline = new Date(endTime);

        var remainTime = setInterval(() => {

            var now = new Date().getTime();
            var diff = Math.floor((deadline - now) / 1000);
            var s = diff % 60;
            var min = Math.floor(diff / 60) % 60;
            var hrs = Math.floor(diff / (60 * 60)) % 60;

            if (hrs < 0 && min < 0 && s < 0 && inRoom) {
                M.toast({
                    html: 'Contest ended',
                    classes: "#ce93d8 purple",
                    displayLength: 5000,
                })
                clearInterval(remainTime)
            }
            else {
                setSeconds(s)
                setMinutes(min)
                setHours(hrs)
            }

        }, 1000)
    }

    function Entry_into_room() {
        var user = JSON.parse(localStorage.getItem('user'))
        var found = false;
        for (var i = 0; i < participants.length; ++i) {
            if (participants[i].email == user.email) {
                found = true;
                break;
            }
        }

        if (found == false) {
            fetch(`/contest/joinRoom/${roomId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                }
            })
                .then(res => res.json())
                .then((data) => {
                    // console.log(data)
                    if (data.error) {
                        // console.log(data.error)
                        M.toast({
                            html: data.error,
                            classes: "#ce93d8 purple",
                            displayLength: 1000,
                        })
                    }
                    else {
                        // history.push(`/room/${joinRoom}`)
                        setInRoom(true)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
        else {
            setInRoom(true)
        }

    }

    let i = -1;
    var index_scoreboard = 100;

    var time = new Date(start_timings).toLocaleString()
    return (
        <div style={{ marginTop: '100px' }}>
            {/* if in room */}
            <div className="container" style={{ display: inRoom ? '' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '60%' }}>
                        <h4>Room name: {roomName}</h4>
                        <h4>Room Id: {roomId}</h4>

                        {
                            contestStarted && hours >= 0 && minutes >= 0 && seconds >= 0
                                ?
                                <h4>Time Remaining : {hours}h {minutes}min {seconds}sec</h4>
                                :
                                <h4>Before start : {hours}h {minutes}min {seconds}sec</h4>
                        }
                        <h4>Total participants: {participants.length}</h4>
                    </div>

                    <div style={{ width: '40%' }}>
                        <div style={{ paddingTop: '50px' }}>
                            {
                                participants.map((part) => {
                                    // console.log(part)
                                    return (
                                        <div key={part._id} className='chip'>
                                            {part.name}
                                        </div>
                                    )
                                })
                            }
                        </div>

                        <div style={{ display: 'flex' }}>
                            <button className='blobby-button' onClick={() => { Refresh(false) }}
                                style={{
                                    margin: '30px',
                                    minWidth: 'fit-content'
                                }}>
                                Refresh
                                <BlobbyButton />
                            </button>
                            <button className='blobby-button' onClick={() => LeaveRoom()}
                                style={{
                                    margin: '30px',
                                    minWidth: 'fit-content'
                                }}>
                                Leave Room
                                     <BlobbyButton />
                            </button>
                        </div>


                    </div>

                </div>

                <h3> Problems </h3>
                <br></br>

                {
                    contestStarted
                        ?
                        questionList.length == 0
                            ?
                            <h2>Loading questions {questions_loaded_percentage} %</h2>
                            :
                            <></>
                        :
                        <></>
                }

                <div className='row question-cards'
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                        // padding: '1rem 2rem 1rem',
                        // /* box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.667); */
                        // borderRadius: '15px',
                        // background: 'rgba(230, 236, 233, 0.349)',
                        // overflow: 'hidden',
                        // bordertop: '1px solid rgba(255, 255, 255, 0.5)',
                        // backdropFilter: 'blur(5px)'
                    }} >



                    {

                        questionList.map(question => {
                            let ID = "ABCDEF";
                            i += 1;
                            return (
                                <a className='col s4 m4' href={`https://codeforces.com/problemset/problem/${question.contestId}/${question.index}`}
                                    target='_blank' style={{}}
                                >
                                    <div id="Question" className='card-text question-card-hover' key={question.name} style={{
                                        height: '250px',
                                        width: '250px',
                                        padding: '1rem 1rem 1rem',
                                        margin: '2rem',
                                        /* box-shadow: 20px 20px 50px rgba(0, 0, 0, 0.667); */
                                        borderRadius: '15px',
                                        background: 'rgba(230, 236, 233, 0.349)',
                                        overflow: 'hidden',
                                        borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                                        backdropFilter: 'blur(5px)',
                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.667)'
                                    }}>

                                        {/* <div className="ques-title">
                                            {question.name}
                                        </div> */}

                                        <div className='ques-title' style={{ height: '200px' }}>
                                            <span className='card-title'><span className="card-text"><strong>{ID[i]}. </strong><strong>{question.name}</strong></span></span>
                                        </div>

                                    </div>
                                </a>
                            )
                        })
                    }
                </div>

                {/* Scoreboard */}
                <div style={{ background: 'rgba(230, 236, 233, 0.349)', backdropFilter: 'blur(5px)', borderRadius: '15px', color: '#e6ff02', textAlign: 'center', fontSize: '1.2rem',boxShadow: '5px 5px 10px black' }}>
                    <table>
                        <thead style={{fontWeight: 'bold'}}>
                            <tr>
                                {
                                    contestStarted
                                        ?
                                        <td width={'186.444px'} style={{ textAlign: 'center' }}>{hours}h {minutes}min {seconds}sec</td>
                                        :
                                        <td width={'186.444px'}></td>
                                }
                                {
                                    questionList.map((ques, index) => {
                                        return (
                                            <td key={ques.name} style={{ textAlign: 'center' }}>{String.fromCharCode(65 + index)}</td>
                                        )
                                    })
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {
                                resultCard.map((item, ide2) => {
                                    return (
                                        <tr key={ide2}>
                                            <td style={{ textAlign: 'center' }}>
                                                {participants[ide2].name}
                                            </td>
                                            {
                                                item.map((scores, index) => {
                                                    var color_of_cell = 'lightgray';
                                                    var time = 0;
                                                    scores == 0
                                                        ?
                                                        color_of_cell = 'lightgray'
                                                        :
                                                        scores != -1
                                                            ?
                                                            color_of_cell = 'lightgreen'
                                                            :
                                                            color_of_cell = 'lightsalmon'

                                                    // scores==0
                                                    //     ?
                                                    //     return()
                                                    var toDisplay;
                                                    scores == 0
                                                        ?
                                                        toDisplay = 0
                                                        :
                                                        scores != -1
                                                            ?
                                                            toDisplay = (Math.floor(scores / 3600)) + ':' + (Math.floor(scores / 60) % 60)
                                                            :
                                                            toDisplay = -1;

                                                    return (
                                                        <td key={index} style={{ backgroundColor: color_of_cell, color: 'black', textAlign: 'center' }}>
                                                            {toDisplay}
                                                        </td>
                                                    )
                                                })
                                            }
                                        </tr>
                                    )
                                })
                            }
                        </tbody>

                    </table>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <button className='blobby-button' onClick={() => { Scoreboard() }}>Update Scoreboard<BlobbyButton /></button>
                    </div>

                </div>
            </div>

            {/* if not in room */}
            <div className="room-card" style=
                {{
                    // position: 'relative',
                    // marginTop: '4rem',
                    display: inRoom ? 'none' : 'flex',
                    // justifyContent: 'center',
                    // alignItems: 'center',
                    //maxWidth: '1200px',
                    // flexwrap: 'wrap',
                    // zindex: '1'
                }}>
                <div className="card"
                    style={{
                        // position: 'relative',
                        // width: '50%',
                        // //minWidth: '420px',
                        // minHeight: '400px',
                        // margin: '30px',
                        // boxShadow: '20px 20px 50px rgba(0, 0, 0, 0.667)',
                        // borderRadius: '15px',
                        // background: 'rgba(230, 236, 233, 0.35)',
                        // overflow: 'hidden',
                        // color: '#e6ff02',
                        // borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                        // backdropFilter: 'blur(5px)'
                    }}>
                    <h2>{roomName}</h2>
                    <h4>Contest start timing : {time}</h4>
                    <h4>Initial Question Rating : {initialRating}</h4>
                </div>
                <div className="room-button">
                    <button className="blobby-button" onClick={() => { Entry_into_room() }} style={{
                        // fontSize: '1.6rem',

                    }}>Enter the room <span className="inner">
                            <span className="blobs">
                                <span className="blob"></span>
                                <span className="blob"></span>
                                <span className="blob"></span>

                                <span
                                    className="blob"></span>
                            </span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
                            <defs>
                                <filter id="goo">
                                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10"></feGaussianBlur>
                                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7"
                                        result="goo"></feColorMatrix>
                                    <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
                                </filter>
                            </defs>
                        </svg>
                    </button>
                </div>

            </div>
        </div >
    )
}

export default Room;
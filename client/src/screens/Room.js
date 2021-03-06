import {useEffect,useState} from 'react'
import {Link, useHistory,useParams} from 'react-router-dom'
import './design.css'
import M from 'materialize-css'


function compare(a, b){
    return a.result.problem.rating - b.result.problem.rating;
}

function randomize(a, b) {
    // var t=Math.random()
    return 1;
}

function Room()
{
    

    const history=useHistory();
    const {roomId}=useParams();
    const [roomName,setRoomName]=useState('');
    const [participants,setParticipants]=useState([])
    // var participants=[]
    const [questionList,setQuestionList]=useState([])
    const [q2,setQ2]=useState([])
    var startTime,endTime;
    const [hours,setHours]=useState(0);
    const [minutes,setMinutes]=useState(0);
    const [seconds,setSeconds]=useState(0);
    const [contestStarted,setContestStarted]=useState(false)
    const [scores, setscores] = useState([]);
    const [questions_loaded_percentage,setQuestionsPercentage]=useState(0.0)
    // const [resultCard,setResultCard]=useState(Array.from({1: 5},()=> Array.from({1: 5}, () => null)));
    // var resultCard=[[]];
    const [resultCard,setResultCard]=useState(new Array(5))
    var isAdmin=false;
    var user;


    useEffect(()=>{
        user=JSON.parse(localStorage.getItem('user'))
        fetch(`/contest/roomDetails/${roomId}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + localStorage.getItem('jwt')
            }
        })
        .then(res=>res.json())
        .then((data)=>{
            if(data.error)
            {
                alert('no such room exists')
                history.push('/home')
            }
            else
            {
                setRoomName(data.name)
               
                setParticipants(data.participants)

                if(user.email == data.adminEmail)
                    isAdmin=true

                startTime=new Date(data.startTiming).getTime()
                endTime=new Date(data.endTiming).getTime()

                var clock=setInterval(()=>{
                var now=new Date().getTime();
                var diff=Math.floor((startTime-now)/1000);
                var s=diff%60;
                var min=Math.floor(diff/60) %60;
                var hrs=Math.floor(diff/(60*60)) % 60;

                if(hrs<0 && min<0 && s<0)
                {
                    setContestStarted(true)
                    clearInterval(clock)
                    M.toast({
                        html:'Contest started',
                        classes: "#ce93d8 purple",
                        displayLength: 5000,
                    })
                    StartContest(true)
                }
                else
                {
                    setSeconds(s)
                    setMinutes(min)
                    setHours(hrs)
                }
                },1000)
            }
            
        })
        .catch((err)=>{
            console.log(err)
        })

        
        

    },[])

    function Scoreboard(){

        var total_questions=5;
        var total_participants=participants.length;
        var score_card=new Array(total_participants);
        for(var i=0; i<total_participants; ++i)
        {
            score_card[i]=new Array(total_questions);      // 5 because we are giving 5 questions
            for(var j=0; j<total_questions; ++j)
            {
                score_card[i][j]=0;
            }
        }

        var handles=[];

        participants.forEach(part=>{
            handles.push(part.codeforces)
        })

        var questions_map=new Map();
        questionList.forEach((ques,index)=>{
            var id=ques.contestId.toString() + ques.index
            questions_map.set(id,index);
        })

        console.log(questions_map)
        FillHandles(0)

        function FillHandles(index)
        {
            if(index >= total_participants)
            {
                setResultCard(score_card)
                // // resultCard=score_card
                // console.log(resultCard)
                // console.log('stopping')
                return;
            }

            fetch(`https://codeforces.com/api/user.status?handle=${handles[index]}&from=1&count=30`)
            .then(res=>res.json())
            .then((data)=>{
                data.result.forEach((item)=>{
                    var id=item.problem.contestId.toString() + item.problem.index;
                    if(questions_map.has(id))
                    {
                        var questionIndex=questions_map.get(id);
                        console.log(questionIndex)
                        if(item.verdict === 'OK')
                        {
                            score_card[index][questionIndex]=1;
                        }
                        else
                        {
                            score_card[index][questionIndex]=2;
                        }
                    }
                    
                })
                FillHandles(index+1)
            })

        }

        console.log(score_card)

        // let handles=[]
        // let nmap = new Map()//for mapping rating to score
        // let userscores = []//for mapping user and his/her score
        // let i = 0;
        // nmap.set(800, 500);
        // nmap.set(900, 1000);
        // nmap.set(1000, 1500);
        // nmap.set(1100, 2000);
        // nmap.set(1200, 2500);
        // nmap.set(1300, 3000);
        // participants.forEach(part=>{
        //     handles.push(part.codeforces)
        // })
        // handles.forEach(function(handle){
        //     if(handle.length == 0 ){
        //         alert("")
        //     }
        //     let score = 0;
        //     fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=30`)
        //     .then(response=> response.json())
        //     .then(data =>{
        //         let arr = []
        //         let i = 0;
        //         data.result.forEach(function(submission){//loop to check the submissions of user
        //             let id = submission.problem.contestId.toString() + submission.problem.index;
        //             let obj;
        //             questionList.forEach(function(question){//loop to check if the user has solved any of the problems given in the contest
        //                 let id2 =  question.contestId.toString() + question.index;
        //                 if(id === id2 && submission.verdict === "OK"){
        //                     obj = question;
        //                     return;
        //                 }
        //             })
        //             if(typeof(obj) === undefined )
        //                 return;
        //             arr[i] = obj;//appending all the problems that are successfully solved
        //             i += 1;
        //         })
                
        //         arr.forEach(function(submission){//traversing the solved problems and calculating the user's score
        //             score += nmap[submission.rating] 
        //         })
        //     })
        //     //mapping the user to his/her score
        //     userscores[i]= { handle : score };
        //     i += 1;
        // })
        // setscores(userscores);
    }

    function FillHandles(index,nmap,handles,totalParticipants)
    {
        if(index >= totalParticipants)
        {
            GetProblems(nmap)
            return;
        }

        var limit=Math.min(totalParticipants-index,4);
        var calls=0;

        fetch(`https://codeforces.com/api/user.status?handle=${handles[index]}`)
        .then(response => response.json())
        .then(data =>{
            data.result.forEach(function(element){
                let id = element.problem.contestId.toString() + element.problem.index;
                if( element.verdict === "OK")
                    nmap.set( id, true);
            })
            ++index
            setQuestionsPercentage(Math.trunc((index/totalParticipants)*100))
            FillHandles(index,nmap,handles,totalParticipants);
        })
        // setInterval(()=>{

        // },21)

    }

    function GetProblems(nmap)
    {   
        // console.log('get problems called')
        let arr = [];
        let k = 800;
        fetch(`https://codeforces.com/api/problemset.problems`)
        .then(response => response.json())
        .then( data =>{
            //console.log(data);
            // data.result.problems.sort(randomize);
            //console.table(data.result.problems);
            data.result.problems.forEach(function(element){
                let id = element.contestId.toString() + element.index;
                let flag = true;
                element.tags.forEach(function(element2){
                    if(element2 === "special problem"){
                        flag = false;
                    }
                })
                if( flag === true && k < 1400 && nmap.get(id) != true && element.rating == k ){
                    arr[i] = element;
                    i += 1;
                    k += 100;
                }
            });
            
            // setQ2(questionList)
            setQuestionList(arr)
            console.log(new Date().toUTCString())
            // console.log(questionList);
        })
    }

    function FilterProblems(participants_array)
    {
        let i = 0;
        let nmap = new Map();
        // let handles = ['umanggupta001122', 'Marcos_0901', 'Lord_Invincible', 'shantys502', 'DLN','mexomerf','jainanshika193'];
        let handles=[]
        participants_array.forEach((part)=>{
            handles.push(part.codeforces)
        })
        console.log(handles)

        var totalParticipants=handles.length;

        FillHandles(0,nmap,handles,totalParticipants)

    }
    
    function Refresh(contestStarted)
    {
        fetch(`/contest/roomDetails/${roomId}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + localStorage.getItem('jwt')
            }
        })
        .then(res=>res.json())
        .then((data)=>{
            if(data.error)
            {
                alert('no such room exists')
                history.push('/home')
            }
            else
            {   
                setRoomName(data.name)
                setParticipants(data.participants)
                if(contestStarted)
                {
                    // GetProblems(data.participants);
                    console.log(new Date().toUTCString())
                    FilterProblems(data.participants)
                }
            }
            
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    function LeaveRoom()
    {
        fetch(`/contest/leaveRoom/${roomId}`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + localStorage.getItem('jwt')
            }
        })
        .then(res=>res.json())
        .then((data)=>{
            // console.log(data)
            if(data.error)
            {
                M.toast({
                html:data.error,
                classes: "#ce93d8 purple",
                displayLength: 1000,
                })
            }
            else
            {
                history.push('/home')
            }
            
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    function StartContest(contestStarted)
    {
        Refresh(true)
        // GetProblems()
        // var now=new Date().getTime();
            var deadline=new Date(endTime);

            var remainTime=setInterval(()=>{

                var now=new Date().getTime();
                var diff=Math.floor((deadline-now)/1000);
                var s=diff%60;
                var min=Math.floor(diff/60) %60;
                var hrs=Math.floor(diff/(60*60)) % 60;

                if(hrs<0 && min<0 && s<0)
                {
                    M.toast({
                        html:'Contest ended',
                        classes: "#ce93d8 purple",
                        displayLength: 5000,
                    })
                    clearInterval(remainTime)
                }
                else
                {
                    setSeconds(s)
                    setMinutes(min)
                    setHours(hrs)
                }

        },1000)
    }
    

    let i = -1;
    return (
        <div className="container">
            <h3>Room name: {roomName}</h3>
            <h3>Room Id: {roomId}</h3>
            
            {
                contestStarted
                ?
                    <h3>Time Remaining : {hours}h {minutes}min {seconds}sec</h3>
                :
                    <h3>Before start : {hours}h {minutes}min {seconds}sec</h3>
            }
            <h3>Total participants: {participants.length}</h3>
            <br/>
            <button className='waves-effect waves-light btn-large' onClick={()=>{Refresh(false)}} style={{margin:'30px'}}>Refresh</button>
            <button className='waves-effect waves-light btn-large' onClick={()=>LeaveRoom()} style={{margin:'30px'}}>Leave Room</button>
            {/* <input type></input> */}
            {/* <button className='btn-large' onClick={()=>StartContest()} style={{margin:'20px'}}>Start Contest</button> */}
            <div>
                <h3>Participants are : </h3>
               { 
                
                participants.map((part)=>{
                    // console.log(part)
                    return (
                            <div key={part._id}>
                                <h3>{part.name}</h3>
                            </div>
                        )
                    })
                }
                <br></br>
                <br></br>
            </div>
                <h2> Problems </h2>
                <br></br>
            
            {
                contestStarted
                ?
                    questionList.length == 0
                    ?
                    <h1>Loading questions {questions_loaded_percentage} %</h1>
                    :
                    <></>
                :
                <></>
            }
           
            <div className='row' >
                     {
                         
                         questionList.map(question=>{
                             let ID = "ABCDEF";
                             i += 1;
                             return (
                                 
                                      <div className='card' key={question.name}>
                                          <a className='col s4 m4' href={`https://codeforces.com/problemset/problem/${question.contestId}/${question.index}`} 
                                            target='_blank' 
                                            
                                            
                                            >
                                          <div className='card-content card-panel hoverable yellow' style={{height:'200px'}}>
                                              <span className='card-title'><span className="card-text"><strong>{ID[i]}. </strong><strong>{question.name}</strong></span></span>
                                              
                                              {/* {
                                                  question.tags.map((tag)=>{
                                                      return (
                                                          <p key={question.name+tag}>{tag}</p>
                                                      )
                                                  })
                                              } */}
                                             
                                          </div>
                                          </a>  
                                      </div>
                             )
                         })
                     }
                      
                      
                 
           </div>
                
            {/* Scoreboard */}
            <div>
                <table>
                    {
                        resultCard.forEach((item,ide2)=>{
                            // console.log(resultCard)
                            // console.log(resultCard.length)
                            // console.log('2=',ide2)
                            return (
                                <tr>
                                    {
                                        item.forEach((scores,index)=>{
                                            // console.log('index=',index)
                                            return (
                                                <td>{scores}</td>
                                            )
                                        })
                                    }
                                </tr>
                            )
                        })
                    }
                </table>
                <button onClick={()=>{Scoreboard()}}>Scoreboard</button>
            </div>
        </div>
    )
}

export default Room;
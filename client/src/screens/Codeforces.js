import {useEffect,useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import CanvasJSReact from '../assets/canvasjs.react'
import './design.css';
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

function compare(a, b){
    return b.y - a.y;
}

function comparator(a,b)
{
    return a.x-b.x;
}
function Codeforces(){
    const history=useHistory()
    // const handle = 'Marcos_0901';
    const [loaded,setLoaded]=useState(false)
    const [options,setOptions]=useState({})
    const [handle,setHandle]=useState()
    const [totalQuestions,setTotalQuestion]=useState(0);
    const [options2,setOptions2]=useState({})
    const [options3,setOptions3]=useState({})
    const [options4,setOptions4]=useState({})
    const [unsolvedQuestion,setUnsolvedQuestion]=useState([])
    const [weakTopics, setWeakTopics]=useState([])
    const [intermediateTopics, setIntermediateTopics] = useState([])
    const [strongTopics, setStrongTopics] = useState([])
    var user;
    const [username, setusername] = useState();
    useEffect(()=>{
        user=JSON.parse(localStorage.getItem('user'))
        if(!user)
        {
            history.push('/signin')
        }
        setHandle(user.codeforces)
        // username = user.name;
        setusername(user.name);
        if(user.codeforces)
        trigger_after_page_loading()
        else
        {
            history.push('/profile')
        }
        console.log(username);
    },[handle]);

    function FillQuestionByRating(questions_by_rating_map)
    {
        var list=[]
        const iterator1=questions_by_rating_map[Symbol.iterator]();
        for(const item of iterator1)
        {
            var temp_object={
                x:item[0],
                y:item[1]
            }
            list.push(temp_object)
        }
        list.sort(comparator)
        console.log(list)
        const temp_options_4={
                    animationEnabled: true,
			        theme: "light2",
                    backgroundColor:'rgba(0,0,0,0)',
                    lineColor:'White',
			        title:{
                        text: "Rating wise submissions",
                        fontSize :30,
                        fontColor : "White",
                        fontFamily: "'Nova Round', cursive",
                        horizontalAlign : "center",
                        padding: 5,
			        },
			        axisX: {
			        	title: "Rating",
                        // reversed: true,
                        labelAutoFit:true,
                        labelFontSize:15,
                        labelFontColor:'White',
                        labelFontFamily: "'Nova Round', cursive",
                        titleFontColor:'White',
                        titleFontFamily: "'Nova Round', cursive",
                        lineColor:'White',
			        },
			        axisY: {
			        	title: "Number of Questions successfully solved",
                        labelAutoFit:true,
                        labelFontSize:15,
                        labelFontColor:'White',
                        labelFontFamily: "'Nova Round', cursive",
                        titleFontColor:'White',
                        titleFontFamily: "'Nova Round', cursive",
                        lineColor:'White',
                    },
                    height : 500,
			        data: [{
			        	type: "area",
                        dataPoints: list,
                        lineColor:'White'
			        }]
        }
        setOptions4(temp_options_4)
    }

    function trigger_after_page_loading()
    {
        // if(handle.length == 0)
        // {
        //     alert("Please set your codeforces handle");
        //     history.push('/profile');
        // }
        
        let arr = [];
        var dtype = [];
        let i = 0;
        let nmap = new Map();

        console.log(handle)
        fetch(`https://codeforces.com/api/user.status?handle=${handle}`)
        .then(response => response.json())
        .then((data) =>{
            
            var total_question=new Set()
            var questions_per_day_map=new Map()
            var questions_per_day_array=[];
            var questions_by_rating_map=new Map()
            // console.log(typeof(data.result))
            console.log(data.result)
            data.result.forEach((element)=>{
                if(element.verdict === 'OK')
                {
                    var unique=element.problem.contestId.toString() + element.problem.index
                    total_question.add(unique)
                    
                    var dateOfQues = new Date(element.creationTimeSeconds*1000);
                    var formattedDate = dateOfQues.getDate() + '/' + (dateOfQues.getMonth()+1) + '/' + dateOfQues.getFullYear();

                    if(questions_per_day_map.has(formattedDate))
                    {
                        questions_per_day_map.set( formattedDate , questions_per_day_map.get(formattedDate)+1);
                    }
                    else
                    {
                        questions_per_day_map.set( formattedDate , 1);
                    }

                    if(questions_by_rating_map.has(element.problem.rating))
                    {
                        questions_by_rating_map.set(element.problem.rating,questions_by_rating_map.get(element.problem.rating)+1)
                    }
                    else
                    {
                        questions_by_rating_map.set(element.problem.rating,1)
                    }
                }
                
                // else
                // {
                //     all_unsolved_question.add(element.problem.contestId.toString() + element.problem.index)
                // }
            })
            // console.log(questions_by_rating_map)
            FillQuestionByRating(questions_by_rating_map)
            {/* FOR CALCULATING ALL UNSOLVED */}

            var all_unsolved_question=new Set()
            // console.log(total_question)
            var us_ques_array=[]
            data.result.forEach((element)=>{
                var qID=element.problem.contestId.toString() + element.problem.index

                if(!total_question.has(qID) && !all_unsolved_question.has(qID))
                {
                    all_unsolved_question.add(qID)
                    us_ques_array.push(element)
                }
            })
            // console.log(all_unsolved_question)
            setUnsolvedQuestion(us_ques_array);
            console.log(us_ques_array)
            // console.log(unsolvedQuestion.length)

            {/**/}

            const iterator1=questions_per_day_map[Symbol.iterator]();
            for(const item of iterator1)
            {
                var temp_object={
                    label:item[0],
                    y:item[1]
                }
                questions_per_day_array.push(temp_object)
            }

            // questions_per_day_array.reverse()
            // console.log(questions_per_day_array)

            var temp_options_2={
                animationEnabled: true,
			        theme: "light2",
                    backgroundColor:'rgba(0,0,0,0)',
                    lineColor:'White',
			        title:{
                        text: "Questions done per day",
                        fontSize :30,
                        fontColor : "White",
                        fontFamily: "'Nova Round', cursive",
                        horizontalAlign : "center",
                        padding: 5,
			        },
			        axisX: {
			        	title: "Date",
                        reversed: true,
                        labelAutoFit:true,
                        labelFontSize:15,
                        labelFontColor:'White',
                        labelFontFamily: "'Nova Round', cursive",
                        titleFontColor:'White',
                        titleFontFamily: "'Nova Round', cursive",
                        lineColor:'White',
			        },
			        axisY: {
			        	title: "Number of Questions successfully solved",
                        labelAutoFit:true,
                        labelFontSize:15,
                        labelFontColor:'White',
                        labelFontFamily: "'Nova Round', cursive",
                        titleFontColor:'White',
                        titleFontFamily: "'Nova Round', cursive",
                        lineColor:'White',
                    },
                    height : 500,
			        data: [{
			        	type: "spline",
                        dataPoints: questions_per_day_array,
                        lineColor:'White'
			        }]
            }

            setOptions2(temp_options_2)

            setTotalQuestion(total_question.size)

            data.result.forEach(function(element){
                
                if( element.verdict === "OK"){
                    i += 1;
                    arr[i] = element.problem.tags;
                }
            });
            i = 0;
            arr.forEach( function(element){
                element.forEach(function(str){
                    if( nmap.has(str) == false )
                        nmap.set(str, 1);
                    else{
                        let v = nmap.get(str);
                        nmap.set(str, v+1);
                    }
                })
            })
            for (let [key, value] of nmap) {
                //console.log(key + ' = ' + value);
                dtype[i] = { label : key, y : value };
                i += 1;
              }
            dtype.sort(compare);
            var temp_options_1 = {
                    animationEnabled: true,
			        theme: "light2",
                    backgroundColor:'rgba(0,0,0,0)',
                    lineColor:'White',
			        title:{
                        text: "Your Question wise performance",
                        fontSize :30,
                        fontColor : "White",
                        fontFamily: "'Nova Round', cursive",
                        horizontalAlign : "center",
                        padding: 5,
                        //borderThickness: 2,
                        //dockInsidePlotArea : true
			        },
			        axisX: {
			        	title: "Problem tags",
                        reversed: true,
                        // labelAutoFit:true,
                        labelFontSize:20,
                        interval:1,
                        labelFontColor:'White',
                        labelFontFamily: "'Nova Round', cursive",

                        tickLength: 1,
                        titleFontColor:'White',
                        titleFontFamily: "'Nova Round', cursive",

                        // labelMaxWidth: 70
			        },
			        axisY: {
			        	title: "Number of Questions successfully solved",
                        titleFontFamily: "'Nova Round', cursive",
			        	includeZero: true,
                        labelFontSize:20,
                        // interval:1,
                        labelAutoFit:true,
                        // tickLength: 1,
                        labelMaxWidth: 70,
                        labelFontColor:'White',
                        labelFontFamily: "'Nova Round', cursive",

                        titleFontColor:'White',
                    },
                    height : 700,
			        data: [{
			        	type: "bar",
                        dataPoints: dtype
			        }]
             }
             setOptions(temp_options_1)

            /* STRONG WEAK TOPICS */

            var forStrong=(total_question.size)*(0.20);
            var forIntermediate=(total_question.size)*(0.07);

            var strong_topics_temp=[]
            var intermediate_topics_temp=[]
            var weak_topics_temp=[]

            dtype.forEach((element)=>{
                if(element.y >= forStrong)
                strong_topics_temp.push(element)
                else if(element.y >= forIntermediate)
                intermediate_topics_temp.push(element)
                else
                weak_topics_temp.push(element)
            })

            // console.log(strong_topics_temp)
            // console.log(intermediate_topics_temp)
            // console.log(weak_topics_temp)
            setStrongTopics(strong_topics_temp)
            setIntermediateTopics(intermediate_topics_temp)
            setWeakTopics(weak_topics_temp)

            /*....................*/

        })
        .catch((err)=>{
            console.log(err)
        })

        var rating_change_graph=[]
        fetch(`https://codeforces.com/api/user.rating?handle=${handle}`)
        .then(res=>res.json())
        .then((data)=>{
            // data.result.reverse()
            data.result.forEach((element)=>{
                var temp_object={
                    x:new Date(element.ratingUpdateTimeSeconds*1000),
                    y:element.newRating
                }
                rating_change_graph.push(temp_object)
            })
            console.log(rating_change_graph)
            var temp_options_3={
                animationEnabled: true,
			        theme: "light2",
                    backgroundColor:'rgba(0,0,0,0)',
                    lineColor:'White',
			        title:{
                        text: "Your rating change",
                        fontSize :30,
                        fontColor : "White",
                        fontFamily: "'Nova Round', cursive",
                        horizontalAlign : "center",
                        padding: 5,
			        },
			        axisX: {
			        	title: "Date",
                        // reversed: true,
                        labelAutoFit:true,
                        labelFontSize:15,
                        labelFontColor:'White',
                        titleFontColor:'White',
                        lineColor:'White',
			        },
			        axisY: {
			        	title: "Rating",
                        labelAutoFit:true,
                        labelFontSize:15,
                        labelFontColor:'White',
                        titleFontColor:'White',
                        lineColor:'White',
                    },
                    height : 500,
			        data: [{
			        	type: "spline",
                        dataPoints: rating_change_graph,
                        lineColor:'White'
			        }]
            }

            setOptions3(temp_options_3)
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    return (
        
        <div className="Codeforces-div">
            <h2 style={{marginTop: '8rem', fontSize: '2.7rem'}}>Hi {username},<br></br> You have done {totalQuestions} questions on Codeforces</h2>

            <div style={{marginLeft:'25px', marginRight:'25px', marginTop:'100px'}}>
                <CanvasJSChart options = {options3}/>
            </div>

    	    <div style={{height:'800px' , marginLeft:'25px', marginRight:'25px', marginTop:'175px'}}>
                <CanvasJSChart options = {options} />
            </div>
            
            <div style={{marginLeft:'25px', marginRight:'25px', marginTop:'0px'}}>
                <CanvasJSChart options = {options2}/>
            </div>

            

            <div style={{marginLeft:'25px', marginRight:'25px', marginTop:'175px'}}>
                <CanvasJSChart options = {options4}/>
            </div>
            
            {/* <h4 style={{marginTop:'175px'}}>&#223;</h4>
            <h4>We are writing logics to improve the selection of strong, weak, intermediate topics &#128515;</h4>
            <h4>Till then, let us know how correct are we &#128521;</h4> */}
            <div className="topics-container">
            <div className='strong-weak-topics' style={{display:'flex', flexDirection:'row', justifyContent:'space-evenly'}}>
                <div>
                    <h4 className="div-heading">Strong Topics</h4>
                    {
                        strongTopics.map(item=>{
                            // console.log(item.label)
                            return (
                                <div key={item.label} className="item" style={{fontSize: '1.5rem'}}>
                                    <Link to={`/codeforcesPractice/${item.label}`} style={{color:'burlywood'}}>
                                        {item.label}
                                    </Link>
                                    
                                </div>
                            )
                        })
                    }
                </div>

                
                <div>
                    <h4 className="div-heading">Intermediate Topics</h4>
                    {
                        intermediateTopics.map((item)=>{
                            return (
                                <div key={item.label} className="item" style={{fontSize: '1.5rem'}}>
                                    <Link to={`/codeforcesPractice/${item.label}`} style={{color:'burlywood'}}>
                                        {item.label}
                                    </Link>
                                </div>
                            )
                        })
                    }
                </div>

                <div>
                    <h4 className="div-heading">Weak Topics</h4>
                    {
                        weakTopics.map((item)=>{
                            return (
                                <div key={item.label} className="item" style={{fontSize: '1.5rem'}}>
                                    <Link to={`/codeforcesPractice/${item.label}`} style={{color:'burlywood'}}>
                                        {item.label}
                                    </Link>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            </div>
            <div style={{marginTop:'150px', marginLeft:'50px', marginRight:'50px'}}>
                <h1>Unsolved Questions</h1>
                {
                    unsolvedQuestion.map((item)=>{
                        return (
                            <div key={item.creationTimeSeconds} className='chip'>
                                <span>
                                    <a href={`https://codeforces.com/contest/${item.contestId}/problem/${item.problem.index}`} target='_blank' style={{fontSize:'2vw'}}>{item.problem.name}</a> 
                                        <span style={{fontSize:'12px', marginLeft:'3px'}}>
                                            rating = {item.problem.rating}
                                        </span>
                                    </span>
                            </div>
                        )
                    })
                }
            </div>

        </div>
        
    );
}

export default Codeforces;
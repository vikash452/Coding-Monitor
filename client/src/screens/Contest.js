import {useEffect,useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import M from 'materialize-css'

function Contest()
{
    const [roomName,setRoomName]=useState('');
    const [joinRoom,setJoinRoom]=useState('');
    const history=useHistory()

    function CreateRoom()
    {
        fetch('/contest/createRoom',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Bearer ' + localStorage.getItem('jwt')
            },
            body:JSON.stringify({
                name:roomName
            })
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
                M.toast({
                html:`room Id is : ${data.roomId}`,
                classes: "#ce93d8 purple",
                displayLength: 5000,
                })

                M.toast({
                html:`Now join the room with the id`,
                classes: "#ce93d8 purple",
                displayLength: 4000,
                })

                setJoinRoom(data.roomId)
                
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    function Join()
    {
        // console.log(joinRoom)
        fetch(`/contest/joinRoom/${joinRoom}`,{
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
                // console.log(data.error)
                M.toast({
                html:data.error,
                classes: "#ce93d8 purple",
                displayLength: 1000,
                })
            }
            else
            {
                history.push(`/room/${joinRoom}`)
            }
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    return (
        <div>
            <div>
                Create  a room
                <br/>
                <input type='text' placeholder='Room name' style={{maxWidth:'300px'}}
                onChange={(e)=>{
                    setRoomName(e.target.value)
                }}
                />
                <br/>
                <button onClick={()=>{CreateRoom()}}>Create</button>
            </div>
            <br/><br/>
            <h1>OR</h1>
            <br/><br/>
            <div>
                Join a room
                <br/>
                <input type='text' placeholder='Room Id' style={{maxWidth:'300px'}} value={joinRoom}
                onChange={(e)=>{
                    setJoinRoom(e.target.value)
                }}
                />
                <button onClick={()=>{Join()}}>Join</button>
            </div>
        </div>
    )
}

export default Contest;
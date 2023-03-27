import ClientContext from "../hooks/userContext";
import { useEffect, useContext, useState } from "react";
import axios from "axios";
import Form from 'react-bootstrap/Form';
import { useHistory } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { Alert } from "react-bootstrap";
import Dropdown from 'react-bootstrap/Dropdown';



function Verify(){
    const [sessionId , setSessionId] = useState('');
    const [ OTP , setOTP] = useState('');
    const [ message , setMessage] = useState('');
    const [concerned, setConcerned] = useState('')
    const [reason, setReason] = useState('')
    const history = useHistory();
    const {verifyDevice, setVerifyDevice, globalOption, visitorName} = useContext(ClientContext);
    

    useEffect(() => {
        if (verifyDevice){
            axios.post('https://vdt5mvw7w3.execute-api.us-west-1.amazonaws.com/v1/generateotp', {
                    [globalOption]: verifyDevice
                }).then(function (response) {
                    const body = JSON.parse(response.data.body);
                    const token = body.data.token
                    setSessionId(token)
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    },[verifyDevice]) 

    const handleClickGenerate = () =>{
        axios.post('https://vdt5mvw7w3.execute-api.us-west-1.amazonaws.com/v1/generateotp', {
                    [globalOption]: verifyDevice
                }).then(function (response) {
                    const body = JSON.parse(response.data.body);
                    const token = body.data.token
                    setSessionId(token)
                    setMessage('OTP sent...')
                })
                .catch(function (error) {
                    console.log(error);
                });
    }
    
    const handleClick = () =>{
        axios.post('https://vdt5mvw7w3.execute-api.us-west-1.amazonaws.com/v1/verifyotp', {
                    token: OTP,
                    sessionId:sessionId,
                    concernedPerson: concerned,
                    reason: reason,
                    visitorName: visitorName
                }).then(function (response) {
                    const body = JSON.parse(response.data.body);
                    const message = body.message
                    if(message === 'Validated'){
                        setMessage('Valid OTP...')
                        setTimeout(function(){ 
                            setVerifyDevice('')
                            history.push(`/welcome`);
                        }, 2500);
                    }else if(message === 'Cannot validate OTP.'){
                        setMessage(`Invalid OTP`)
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
    }

    // onClick={()=>{history.push(`/`)}};

    return(
        <>
        { verifyDevice ? 
            <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
                <br/>
                <Dropdown size="lg" style={{displafontSize:"1.25rem", margin: "3rem"}}>
                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">{concerned || "Concerned Person to Meet"}</Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={(e)=>{setConcerned(e.target.innerText)}} value="1">Sameer</Dropdown.Item>
                    <Dropdown.Item onClick={(e)=>{setConcerned(e.target.innerText)}} value="2">Shahid</Dropdown.Item>
                    <Dropdown.Item onClick={(e)=>{setConcerned(e.target.innerText)}} value="3">Abelson</Dropdown.Item>
                    <Dropdown.Item onClick={(e)=>{setConcerned(e.target.innerText)}} value="4">Other</Dropdown.Item>
                </Dropdown.Menu>
                </Dropdown>
                <Form.Control onChange={(event)=>{setReason(event.target.value)}} as="textarea" placeholder="Reason for Visit" rows={3} style={{minWidth:"50%", maxWidth:"75%"}}/>
                <br/>
                <p>OTP sent to {`${verifyDevice}`}</p>
                <Form.Control onChange={(event)=>{setOTP(event.target.value)}} type="text" placeholder="Please enter OTP..." style={{minWidth:"50%", maxWidth:"55%"}}/>
                <br/>
                <Button onClick={handleClick}>Submit</Button>
                <br/>
                {
                    message ? message === 'Valid OTP...' ?
                    <Alert variant="success">
                        Valid OTP
                    </Alert> : message === 'Invalid OTP' ?
                    <Alert variant="danger">
                        Invalid OTP !!! <a href="#" onClick={handleClickGenerate}>Resend OTP</a>
                    </Alert> : 
                    <Alert variant="primary">
                        OTP Sent !!!
                    </Alert> : null

                }
            </div> : 
            <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
                <p>Please select a channel from <a href="/">Homepage</a></p>
            </div>
        }
        
        </>
    )
}
export default Verify;
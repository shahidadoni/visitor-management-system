import ClientContext from "../hooks/userContext";
import { useEffect, useContext, useState } from "react";
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { Alert } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import Cam from "../components/Cam";
import axios from "axios";

function UserDetails(){
    const [ name, setName] = useState('')
    const [ mail, setMail] = useState('')
    const [ phone, setPhone] = useState('')
    const [ company, setCompany] = useState('')
    const [ photograph, setPhotograph] = useState('')
    const [ OtpOption, setOtpOption] = useState('')
    const [ alert, setAlert] = useState('')
    const {optionIfUserNotFound, setVerifyDevice, setGlobalOption, setVisitorName} = useContext(ClientContext);
    const history = useHistory();

    useEffect(() => {
        
        if(optionIfUserNotFound[0] === 'emailId'){
            setMail(optionIfUserNotFound[1])
        }else if(optionIfUserNotFound[0] === 'phoneNumber'){
            setPhone(optionIfUserNotFound[1])
        }
    },[])

    const handleClick = async() =>{
        if( name === ''){
            setAlert('Enter Name')
        }else if(mail === ''){
            setAlert('Enter Email-Id')
        }else if(phone === ''){
            setAlert('Enter Phone Number')
        }else if(company === ''){
            setAlert('Enter Company Name')
        }else if(photograph === ''){
            setAlert('Capture Photograph')
        }else if(OtpOption === ''){
            setAlert('Select an option to send Otp')
        }else{
            if(OtpOption === 'Email Id'){
                setGlobalOption("email")
                setVerifyDevice(mail)
                setVisitorName(name)
            }else if(OtpOption === 'Phone Number'){
                setGlobalOption("phoneNumber")
                setVerifyDevice(phone)
                setVisitorName(name)
            }

            const response = await axios.post('https://vdt5mvw7w3.execute-api.us-west-1.amazonaws.com/v1/userdetails', {
                name: name,
                phoneNumber: phone,
                emailId: mail,
                company: company,
                photograph: photograph
            })
            .then(function (response) {
                const body = response.data.body
                console.log(body.message)
            })
            .catch(function (error) {
                console.log(error);
            });
            history.push(`/verify`)
        }
    }
    return(
        <>
        {
            alert ? 
            <Alert variant="danger">
                {alert}
            </Alert> : null
        }
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <Form.Label column sm="2">
                Name:
            </Form.Label>
            <Col sm="10">
            <Form.Control onChange={(event)=>{setName(event.target.value)}} type="text" placeholder="Enter your name..." />
            </Col>
            <Form.Label column sm="2">
                Email-Id:
            </Form.Label>
            <Col sm="10">
            <Form.Control onChange={(event)=>{setMail(event.target.value)}} type="email" placeholder="name@example.com" 
            // value={ optionIfUserNotFound[0] === 'emailId' ? optionIfUserNotFound[1]:null} 
            value={mail}
            />
            </Col>
            <Form.Label column sm="2">
                Phone Number:
            </Form.Label>
            <Col sm="10">
            <div>
                <PhoneInput
                country={"in"}
                enableSearch={true}
                // value={ optionIfUserNotFound[0] === 'phoneNumber' ? optionIfUserNotFound[1] : null}
                value={phone}
                onChange={(phone) => {setPhone(`+${phone}`)}}
                />
            </div>
            </Col>
            <Form.Label column sm="2">
                Company:
            </Form.Label>
            <Col sm="10">
            <Form.Control onChange={(event)=>{setCompany(event.target.value)}} type="text" placeholder="Enter your company name..." />
            </Col>
            <br/>
            <Dropdown size="lg" style={{displafontSize:"1.25rem"}}>
            <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">{ OtpOption || "Send OTP To.."}</Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={(e)=>{setOtpOption(e.target.innerText)}} value="1">Email Id</Dropdown.Item>
                <Dropdown.Item onClick={(e)=>{setOtpOption(e.target.innerText)}} value="2">Phone Number</Dropdown.Item>
            </Dropdown.Menu>
            </Dropdown>
            <Cam setPhotograph={setPhotograph} />
        </div>
        <br/> 
        <Button onClick={handleClick}>Submit</Button>
        </>
        
    )
}
export default UserDetails;
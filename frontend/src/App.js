import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";
import ClientContext from "./hooks/userContext";
import { useState, useContext } from "react";
import UserDetails from "./routes/UserDetails";
import Verify from "./routes/Verify";
import Welcome from './routes/Welcome';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import Cam from './components/Cam';

const routes = [
  { path: "/userdetails", name: "UserDetails", Component: UserDetails},
  {path: "/verify", name: "Verify", Component: Verify},
  { path: "/welcome", name: "Welcome", Component: Welcome },
  { path: "/", name: "Home", Component: Home }
];

function Navigation() {
  return (
    <Navbar bg="light" expand="lg" style={{backgroundImage:"url(../images/rapyderbackground.jpg)", backgroundSize: "cover"}} >
      <Container className="d-flex flex-row justify-content-center"
      // style={{display:"flex",flexDirection:"row", width:"100%", justifyContent: "center"}}
      >
        <Navbar.Brand>
          <img
              src="images/rapyder.png"
              width="200"
              height="100"
              className="d-inline-block align-top"
              alt="Rapyder logo"
            />
        </Navbar.Brand>
        <Nav.Item>
          <h1 style={{fontSize:"1.75rem", color: "rgb(255, 125, 39)"}}>Rapyder Visitor Management System</h1>
        </Nav.Item>
      </Container>
    </Navbar>
  );
}


function Home() {
  const [option, setOption] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [faceImage, setFaceImage] = useState(null);
  const history = useHistory();
  const {setVerifyDevice, setGlobalOption, setVisitorName, setOptionIfUserNotFound} = useContext(ClientContext)

  const checkUserExists = async() =>{
    let key;
    let value;
    if(email){
      key = "emailId";
      value = email
    }else if(phoneNumber){
      key = "phoneNumber";
      value = phoneNumber
    }else if(faceImage){
      key = "faceImage";
      value = "temporary"
    }

    axios.post('https://vdt5mvw7w3.execute-api.us-west-1.amazonaws.com/v1/checkuser', {
      [key]: value
    })
    .then(function (response) {
      const body = response.data.body
      if(body.message === "User Found"){
        if(body.emailId){
          setGlobalOption("email")
          setVerifyDevice(body.emailId.S)
          setVisitorName(body.name.S)
        }else if(body.phoneNumber){
          setGlobalOption("phoneNumber")
          setVerifyDevice(body.phoneNumber.S)
          setVisitorName(body.name.S)
        }
        history.push(`/verify`);
      }else if(body.message === "User Not Found"){
        setOptionIfUserNotFound([key,value])
        history.push(`/userdetails`);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  return (
    <>
      <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
        <Dropdown size="lg" style={{displafontSize:"1.25rem", margin: "3rem"}}>
          <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">{ option || "Select a Identity Channel"}</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={(e)=>{setOption(e.target.innerText)}} value="1">Email Id</Dropdown.Item>
            <Dropdown.Item onClick={(e)=>{setOption(e.target.innerText)}} value="2">Phone Number</Dropdown.Item>
            <Dropdown.Item onClick={(e)=>{setOption(e.target.innerText)}} value="3">Facial Recognition</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        { option && option === "Email Id" ?
          <Form.Control onChange={(event)=>{setEmail(event.target.value);setPhoneNumber('');setFaceImage(null)}} type="email" placeholder="name@example.com" style={{minWidth:"50%", maxWidth:"55%"}}/>
          : option === "Phone Number" ? 
          <div>
            <PhoneInput
              country={"in"}
              enableSearch={true}
              value={phoneNumber}
              onChange={(phoneNumber) => {setPhoneNumber(`+${phoneNumber}`); setEmail('');setFaceImage(null)}}
            />
          </div>
          : option === "Facial Recognition" ?
          <Cam/>
          : null
        }
        { option ?
          <>
            <br/>
            <Button  onClick={checkUserExists}>Submit</Button>
          </> : null
        }
      </div>
      
    </>
  );
}

function App() {
  const [optionIfUserNotFound, setOptionIfUserNotFound] = useState('')
  const [visitorName, setVisitorName] = useState('')
  const [verifyDevice, setVerifyDevice] = useState('')
  const [globalOption, setGlobalOption] = useState('')


  return (
    <Router>
      <>
      <ClientContext.Provider 
        value={{
          verifyDevice, setVerifyDevice, 
          globalOption, setGlobalOption, 
          visitorName, setVisitorName,
          optionIfUserNotFound, setOptionIfUserNotFound
      }}>
        <Navigation />
        <Container className="py-3">
          <Switch>
            {routes.map(({ path, Component }) => (
              <Route key={path} path={path}>
                <div className="page">
                  <Component/>
                </div>
              </Route>
            ))}
          </Switch>
        </Container>
      </ClientContext.Provider>
      </>
    </Router>
  );
}

export default App;

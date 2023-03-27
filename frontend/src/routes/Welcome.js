import { useContext } from "react";
import ClientContext from "../hooks/userContext";
import logo from "../images/welcome-messages-for-employees.png"


function Welcome(){
    const {visitorName} = useContext(ClientContext);

    return(
        <>
        <div style={{display:"flex",flexDirection:"column", alignItems:"center"}}>
            <br/>
            <h2>Hi, {visitorName}. Welcome to Rapyder Cloud Solutions Pvt. Ltd....!!!</h2>
            <br/>
            <img src={logo} alt="Welcome"/>
        </div>
        </>
    )
}
export default Welcome;
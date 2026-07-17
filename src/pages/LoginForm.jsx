import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ role }) {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

      if(username==="" || password===""){
          alert("Fill all fields");
          return;
      }

      if(role==="Admin"){
          // later admin firestore
          navigate("/admin/dashboard");
          return;
      }

      if(role==="Teacher"){
          // later teacher firestore
          navigate("/teacher/dashboard");
          return;
      }

      if(role==="Student"){
          // later student firestore
          navigate("/student/dashboard");
          return;
      }

      if(role==="Parent"){
          // later parent firestore
          navigate("/parent/dashboard");
          return;
      }

  }

  return(

<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
height:"100vh",
background:"#eef3fb"
}}
>

<div
style={{
width:"430px",
background:"white",
padding:"40px",
borderRadius:"20px",
boxShadow:"0 0 30px rgba(0,0,0,.1)"
}}
>

<h1>{role} Login</h1>

<br/>

<input

placeholder={
role==="Admin"
? "Admin Email"

: role==="Teacher"
? "Teacher Username"

: "Student ID"
}

value={username}

onChange={(e)=>setUsername(e.target.value)}

style={input}

/>

<br/><br/>

<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

style={input}

/>

<br/><br/>

<button

style={button}

onClick={login}

>

LOGIN

</button>

</div>

</div>

  )

}

const input={

width:"100%",

padding:"15px",

fontSize:"17px",

borderRadius:"10px",

border:"1px solid #ccc"

}

const button={

width:"100%",

padding:"15px",

background:"#0d6efd",

color:"white",

border:"none",

borderRadius:"10px",

fontSize:"18px",

cursor:"pointer"

}
// import React,{useState} from 'react';
// import CytoscapeComponent from 'react-cytoscapejs';
// import Axios from 'axios';
// import { BrowserRouter as Router, Routes,Route,useNavigate,useLocation,Link } from 'react-router-dom';
// import { useForm } from 'react-hook-form'
// import { Button, Container, Stack, TextField } from '@mui/material'
// import { saveAs } from "file-saver";
// import ReactLoading from 'react-loading';
// import './App.css';
// import './TopPage.js'
// import './FromJSONFile.js'
// const From_JSONFILE = () => {  
//     const [file,setFile] = useState(null);
//     const [depth,setDepth] = useState(0);
//     const [isLoading,setLoading] = useState(false);
//     const navigate = useNavigate();
//     //const form_data = new FormData();
//     /*const handleFile = event => {
//     console.log(event.target.files);
//       //form_data.append('file',)
//     }*/
//     const handleFileUpload = e => {
//       const efile = e.target.files[0];
//       setFile(efile);
//     }
//     const handleDepth = e => {
//       const dep = e.target.value;
//       setDepth(dep);
//     }
//     const onSubmit = () => {
//       //console.log(data);
//       setLoading(true);
//       const params = new FormData();
//       params.append('file', file);
//       params.append('depth', depth);
//       Axios.post('http://127.0.0.1:5000/file_mode',params,{
//         headers: {
//           'content-type': 'multipart/form-data',
//         },
//       })
//       .then(response => {
//         setLoading(false);
//         if(response.data.state == 0) {
//           navigate("/graph",{ state:{elements:response.data.elem} });
//         }else {
//           console.log(response.data.elem);
//         }
//       });
//     };
//     return(
//       <div>
//         <FileInputForm 
//           handleFileUpload={handleFileUpload}
//           handleDepth={handleDepth}
//           onSubmit={onSubmit}
//           isLoading={isLoading}
//         />
//         {isLoading && <MyLoading />}
//       </div>
//     )
//   }
  
//   const FileInputForm = props => {
//     /*
//     const useUploadButtonStyles = makeStyles((theme) =>
//       createStyles({
//         input: {
//           display: 'none',
//         },
//       })
//     );
//     const classes = useUploadButtonStyles();*/
//     return (
//         <Container maxWidth="sm" sx={{pt:5}}>
//           <Stack spacing= {2}>
//             <Button component="label" disabled={props.isLoading}>
//               <input
//                 disabled={props.isLoading}
//                 className="inputFileBtnHide"
//                 type="file"
//                 onChange={props.handleFileUpload}
//               />
//             </Button>
//             <TextField
//                 disabled={props.isLoading}
//                 label="Depth"
//                 id="outlined-number"
//                 type="number"
//                 InputLabelProps={{
//                   shrink: true,
//                 }}
//                 onChange={props.handleDepth}
//             />
//             <Button 
//               disabled={props.isLoading}
//               onClick={props.onSubmit}
//             >Create a Graph</Button>
//           </Stack>
//         </Container>
//     );
//   }
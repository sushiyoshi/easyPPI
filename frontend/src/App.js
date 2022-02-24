import React,{useState} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Axios from 'axios';
import { BrowserRouter as Router, Routes,Route,useNavigate,useLocation,Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'
import { Button, Container, Stack, TextField } from '@mui/material'
import { saveAs } from "file-saver";
import ReactLoading from 'react-loading';
import './App.css';

class MyApp extends React.Component {
  render () {
    return(
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Title />} />
            <Route path="/from_protein_id" element={<From_ProteinID />} />
            <Route path="/from_json_file" element={<From_JSONFILE />} />
            <Route path="/graph" element={<GraphPage />} />
          </Routes>
        </Router>
      </div>
    );
  }
}

class Title extends React.Component {
  render() {
    return(
      <div >
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/from_protein_id"
        >
          Create From ProteinID
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/from_json_file"
        >
          Create From JSON file
        </Button>
      </div>
    )
  }
}


const MyLoading = props => {
  return(
    <Container maxWidth="sm" sx={{pt:5}}>
      <div className="center">
        <ReactLoading
          type="spin"
          color="#ebc634"
          height="100px"
          width="100px"
          //className="mx-auto"
        />
        <p className="text-center mt-3">Loading...</p>
      </div>
    </Container>
  );
}

const From_ProteinID = () => {  
  const navigate = useNavigate();
  const [isLoading,setLoading] = useState(false);
  const onSubmit = (data) => {
    setLoading(true)
    Axios.get('http://127.0.0.1:5000/protein_id',{
    params:{
      target:data.protein_id,
      depth:data.depth,
    }})
    .then((response) => {
      setLoading(false)
      if(response.data.state == 0) {
        navigate("/graph",{ state:{elements:response.data.elem} });
      }else {
        console.log(response.data.elem);
      }

    });
  };
  return(
    <div>
      <div className="test">
      <InputForms onSubmit={onSubmit} isLoading={isLoading}/>
      </div>
      {isLoading && <MyLoading />}
      {isLoading && <BlackOut />}
    </div>
  )
}

const BlackOut = () => {
  return (
    <div style= {{
      "position":"absolute",
      "top":"0px",
      "left":"0px",
    
      "width":"100%",
      "height":"100%",
    
      "background-color":"#000000",
      "opacity":0.5,
      //"visibility":"hidden",
      "z-index":1,
    }} />
  )
}

const InputForms= props => {
  const { register, handleSubmit } = useForm();
  return (
    <Container maxWidth="sm" sx={{pt:5}}>
      <Stack spacing= {2}>
      <TextField 
        disabled={props.isLoading}
        label="Protein ID"
        //id="outlined-basic"  
        //id="outlined-disabled"
        {...register('protein_id')}
        variant="outlined"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
          disabled={props.isLoading}
          label="Depth"
          id="outlined-number"
          {...register('depth')}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
      />
      <Button 
        disabled={props.isLoading}
        onClick={handleSubmit(props.onSubmit)}
      >Create a Graph</Button>
      </Stack>
    </Container>
  );
}

const From_JSONFILE = () => {  
  const [file,setFile] = useState(null);
  const [depth,setDepth] = useState(0);
  const [isLoading,setLoading] = useState(false);
  const navigate = useNavigate();
  //const form_data = new FormData();
  /*const handleFile = event => {
    console.log(event.target.files);
    //form_data.append('file',)
  }*/
  const handleFileUpload = e => {
    const efile = e.target.files[0];
    setFile(efile);
  }
  const handleDepth = e => {
    const dep = e.target.value;
    setDepth(dep);
  }
  const onSubmit = () => {
    //console.log(data);
    setLoading(true);
    const params = new FormData();
    params.append('file', file);
    params.append('depth', depth);
    Axios.post('http://127.0.0.1:5000/file_mode',params,{
      headers: {
        'content-type': 'multipart/form-data',
      },
    })
    .then(response => {
      setLoading(false);
      if(response.data.state == 0) {
        navigate("/graph",{ state:{elements:response.data.elem} });
      }else {
        console.log(response.data.elem);
      }
    });
  };
  return(
    <div>
      <FileInputForm 
        handleFileUpload={handleFileUpload}
        handleDepth={handleDepth}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
      {isLoading && <MyLoading />}
    </div>
  )
}

const FileInputForm = props => {
  /*
  const useUploadButtonStyles = makeStyles((theme) =>
    createStyles({
      input: {
        display: 'none',
      },
    })
  );
  const classes = useUploadButtonStyles();*/
  return (
      <Container maxWidth="sm" sx={{pt:5}}>
        <Stack spacing= {2}>
          <Button component="label" disabled={props.isLoading}>
            <input
              disabled={props.isLoading}
              className="inputFileBtnHide"
              type="file"
              onChange={props.handleFileUpload}
            />
          </Button>
          <TextField
              disabled={props.isLoading}
              label="Depth"
              id="outlined-number"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={props.handleDepth}
          />
          <Button 
            disabled={props.isLoading}
            onClick={props.onSubmit}
          >Create a Graph</Button>
        </Stack>
      </Container>
  );
}

const GraphPage = () => {
  const { state } = useLocation();
  const handleSendFile = () => {
    //const params = new FormData();
    //params.append('file', state.element);
    /*Axios.post('http://127.0.0.1:5000/download',params,{
      headers: {
        'content-type': 'multipart/form-data',
      },
    })*/
    
    // Axios.post('http://127.0.0.1:5000/download',state.elements,{
    //   headers: {
    //     'content-type': 'application/json',
    //   },
    //   dataType: "binary",
    //   responseType: "blob",
    // }).then(response => {
    //   console.log(response.data)
    //   //navigate("/graph",{ state:{elements:response.data} });
    // });
    // Axios.axios({
    //   method: "POST",
    //   url: "http://127.0.0.1:5000/downloa",
    //   data: state.elements,
    //   headers: {
    //     'content-type': 'application/json', 
    //   },
    //   responseType: "blob"
    // }).then(response => {
    //   console.log(response.data)
    //   //navigate("/graph",{ state:{elements:response.data} });
    // });
    const blob = new Blob([state.elements], {
      type: 'application/json'
    });
    const filename = "test.json";
    saveAs(blob, filename);
  }
  return(<div>
    <Button onClick={handleSendFile}>
      Donwload
    </Button>
    <GraphDrawing elements={state.elements}/>
  </div>);
}

const GraphDrawing = props => {
  const elements = JSON.parse(props.elements)
  const layout ={
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };
  return <CytoscapeComponent
    elements={elements}
    style={{ 
      height: "80%",
      width: "100%",
      position: "absolute",
      left: 0,
      top: 20,
      background: "#35363A",
    }}
    layout={layout} 
    stylesheet={[
    {
      selector: 'node',
      style: {
        content: 'data(name)',
        'text-valign': 'center',
        color: 'white',
        'text-outline-width' : 2,
        'background-color': '#2b7ca4',
        'text-outline-color': '#2b7ca4',
        width: '30px',
        height: '30px',
        'font-size': '15px',
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'line-color': '#555',
        width: 2
      }
    },
    {
      selector: '.root',
      style: {
        'content': 'data(name)',
        'text-valign': 'center',
        'color': 'white',
        'text-outline-width': 2,
        'background-color': '#ffd700',
        'text-outline-color': '#d2691e',
        'width': '50px',
        'height': '50px',
        'font-size': '20px'
      }
    },
    {
      selector:'.pydata',
      style: {
        'display': 'none'
      }
    }
  ]}
  />;
}

export default MyApp ;

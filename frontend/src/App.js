import React,{useState} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Axios from 'axios';
import { BrowserRouter as Router, Routes,Route,useNavigate,useLocation,Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'
import { Button, Container, Stack, TextField ,styled,Grid,Paper,Box} from '@mui/material'
import { saveAs } from "file-saver";
import ReactLoading from 'react-loading';
import { BsCloudDownload ,BsCloudUpload,BsFillLayersFill} from 'react-icons/bs';
import {Gi3DStairs} from 'react-icons/gi';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './App.css';
import {blue, cyan, deepPurple, green, orange, red} from "@mui/material/colors";
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
Cytoscape.use(COSEBilkent);

//import './TopPage.js'
//import './FromJSONFile.js'

//const From_JSONFILE = React.lazy(() => import('./From_JSONFILE'))
//const TopPage = React.lazy(()=> import('./TopPage'))
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: orange,
    secondary: cyan,
  },
});

const Input = styled('input')({
  display: 'none',
});
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const MyApp = () =>{
  return(
    <div>
      <Router>
        <Routes>
          <Route path="/" exact element={<TopPage />} />
          <Route path="/from_protein_id" element={<From_ProteinID />} />
          <Route path="/from_json_file" element={<From_JSONFILE />} />
          <Route path="/graph" element={<GraphPage />} />
        </Routes>
      </Router>
    </div>
  );
}
const TopPage = () => {
  return(
    <div>
    {/* <ThemeContext.Provider value="dark"> */}
    <ThemeProvider theme={darkTheme}>
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
          color="secondary"
          component={Link}
          to="/from_json_file"
      >
          Create From JSON file
        </Button>
    {/* </ThemeContext.Provider> */}
    </ThemeProvider>
    </div>
  )
}

const MyLoading = props => {
  return(
    <Container maxWidth="sm" sx={{pt:2}}>
      <div className="center">
        <ReactLoading
          type="bars"
          color="#FF9900"
          height="100px"
          width="100px"
          className="loading"
        />
        {/* <p className="text-center">Loading...</p> */}

      </div>
    </Container>
  );
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
    }} />
  )
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
      <ThemeProvider theme={darkTheme}>
      <div className="test">
      <InputForms onSubmit={onSubmit} isLoading={isLoading}/>
      </div>
      {isLoading && <BlackOut />}
      {isLoading && <MyLoading />}
      </ThemeProvider>
    </div>
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
        color="secondary"
        //id="outlined-basic"  
        //id="outlined-disabled"
        {...register('protein_id')}
        variant="filled"
        
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
          disabled={props.isLoading}
          label="Depth"
          color="secondary"
          {...register('depth')}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
      />
      <Button 
        disabled={props.isLoading}
        onClick={handleSubmit(props.onSubmit)}
        variant="contained"
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
    <ThemeProvider theme={darkTheme}>
      <FileInputForm 
        handleFileUpload={handleFileUpload}
        handleDepth={handleDepth}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
      {isLoading && <BlackOut />}
      {isLoading && <MyLoading />}
    </ThemeProvider>
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
          {/*<Button component="label" disabled={props.isLoading}>
            <input
              disabled={props.isLoading}
              className="inputFileBtnHide"
              type="file"
              onChange={props.handleFileUpload}
            />
          </Button>*/}
          <label>
            <Input accept="application/json" multiple type="file" onChange={props.handleFileUpload} />
            <Button 
            variant="contained"
            component="span"
            color="secondary"
            startIcon={<BsCloudUpload />}
            disabled={props.isLoading}

            >
              Upload JSON
            </Button>
          </label>
          <TextField
            color="secondary"
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
            variant="contained"
          >Create a Graph</Button>
        </Stack>
      </Container>
  );
}

const GraphPage = () => {
  const { state } = useLocation();
  const [isLoading,setLoading] = useState(false);
  //console.log(useLocation())
  const [proteinInfo,setProteinInfo] = useState(null);
  const elements = JSON.parse(state.elements)
  const protein_name = elements[1].data.name
  const navigate = useNavigate();
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
    const filename = protein_name+".json";
    saveAs(blob, filename);
  }
  const handleNodeClick = obj => {
    setProteinInfo(obj)
    //console.log(proteinInfo)
  }
  const handleSendProtein = () => {
    
    /*
    params.append('file', elements);
    params.append('protein_name', protein_name);
    Axios.post('http://127.0.0.1:5000/deeper_mode',params,{
      headers: {
        'content-type': 'multipart/form-data',
      },
    }).then(response=>{
      console.log(response.data)
    })*/
    setLoading(true);
    Axios.post('http://127.0.0.1:5000/deeper_mode',{"file":elements,"protein_id":proteinInfo.id}).then(response=>{
      setLoading(false);
      console.log(response.data)
      if(response.data.state == 0) {
        navigate("/graph",{ state:{elements:response.data.elem} });
      }else {
        console.log(response.data.elem);
      }
    })
  }
  return(
  
  //<div>
  <ThemeProvider theme={darkTheme}>
    <GraphDrawing elements={elements} className="center" handleNodeClick={handleNodeClick}/>
    <InformationWindow handleSendFile={handleSendFile} proteinInfo={proteinInfo} isLoading={isLoading}comp={elements[0].comp} handleSendProtein={handleSendProtein} />
    {isLoading && <BlackOut />}
    {isLoading && <MyLoading />}
  </ThemeProvider>
  );
}

const commonStyles = {
  bgcolor: 'background.paper',
  borderColor: 'text.primary',
  m: 1,
  border: 1,
  textAlign: "center",
};

const InformationWindow = props => {
  //console.log(props.proteinInfo)
  //console.log(props.elements)
  let flag = props.proteinInfo!=null;
  return(
    <div className="config">
      <Container>
      <Stack>
        <Button variant="outlined" disabled={props.isLoading} startIcon={<BsCloudDownload />} onClick={props.handleSendFile}>
          JSON Download
        </Button>
        <Box sx={{ ...commonStyles, borderRadius: 1 }}>
          
          <Stack>
          <p>Protein Name</p>
          <p>{flag ? props.proteinInfo.name :  'null'}</p>
          <p>Protein ID</p>
          <p>{flag ? props.proteinInfo.id :  'null'}</p>
          
          </Stack>
        </Box>
        {
          props.proteinInfo!=null && props.comp[props.proteinInfo.name][0] == 1 &&
          <Button variant="outlined" disabled={props.isLoading} startIcon={<BsFillLayersFill />} onClick={props.handleSendProtein}>
          Go deeper from current {props.proteinInfo.name}
          </Button>
        }
      </Stack>
      </Container>
    </div>
  )
}

const GraphDrawing = props => {
  //console.log(props.elements)
  //const elements = JSON.parse(props.elements)
  const elements = props.elements
  const layout ={
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 10,
    refresh: 20,
    fit: true,
    padding: 50,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 70,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };
  return <CytoscapeComponent
    cy={(cy) => { 
      cy.on('click','node',e => {
        props.handleNodeClick(e.target._private.data)
      })
    }}
    elements={elements}
    style={{ 
      height: "100%",
      width: "100%",
      position: "absolute",
      left: 0,
      top: 0,
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
        'line-color': '#666',
        width: 2
      }
    },
    {
      selector: '.root',
      style: {
        'content': 'data(name)',
        'text-valign': 'center',
        'color': 'white',
    
        'background-color': '#ff9900',
        'text-outline-color': '#ff9900',
        'width': '50px',
        'height': '50px',
        'font-size': '22px'
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
import React,{useState,useRef,useCallback,useEffect,useMemo} from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Axios from 'axios';
import { BrowserRouter as Router, Routes,Route,useNavigate,useLocation,Link } from 'react-router-dom';
import { useForm} from 'react-hook-form'
import { Button, IconButton,Container, Stack, TextField ,styled,Box,Checkbox} from '@mui/material'
import { saveAs } from "file-saver";
import ReactLoading from 'react-loading';
import { BsCloudDownload ,BsCloudUpload,BsFillLayersFill,BsClipboardMinus,BsClipboardCheck} from 'react-icons/bs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {blue, cyan, deepPurple, green, orange, red} from "@mui/material/colors";
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {motion ,AnimatePresence} from "framer-motion";
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
  typography: {
    button: {
        textTransform: "none",
    }
  }
});

const Input = styled('input')({
  display: 'none',
});

const MyApp = () => {
  return(
    <Router>
      <Routing />
    </Router>
  )
}

const Routing = () =>{
  const location = useLocation();
  return(
      <AnimatePresence exitBeforeEnter={false} initial={true}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" exact element={<TopPage />}  />
          <Route path="/from_protein_id" element={<From_ProteinID />} />
          <Route path="/from_json_file" element={<From_JSONFILE />} />
          <Route path="/graph" element={<GraphPage />} />
        </Routes>
      </AnimatePresence>
  );
}
const TopPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  return(
    <div className="center">
    {/* <ThemeContext.Provider value="dark"> */}
    <ThemeProvider theme={darkTheme}>
      <motion.div
        animate={{
          y: 0,
          opacity: 1
        }}
        initial={{
          y: 50,
          opacity: 0
        }}
        exit={{
          opacity: 0
        }}
        transition={{
          duration: 1.0
        }}
      >
      <Stack spacing={15}>
        <h1>
          easy<span className="orangeText">PPI</span>
        </h1>
        <Stack spacing={5}>
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
            onClick={() => {setIsVisible(true)}}
          >
            Create From JSON file
          </Button>
        </Stack>
      </Stack>
    {/* </ThemeContext.Provider> */}
    </motion.div>
    </ThemeProvider>

    </div>
  )
}

const MyLoading = () => {
  return(
    <Container maxWidth="sm" sx={{pt:2}}>
      <div className="center">
        <ReactLoading
          type="bars"
          color="#FF9900"
          //color="#fff"
          height="100px"
          width="100px"
        />
        <div style={{fontWeight: 'bold',color:"#FFF",textAlign:"center"}}>Loading..</div>.

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
    
      "backgroundColor":"#000000",
      "opacity":0.5,
      //"visibility":"hidden",
    }} />
  )
}

const bioList = []

// const Option = map(bioList,()=>{

// })

const From_ProteinID = () => {  
  const navigate = useNavigate();
  const [isLoading,setLoading] = useState(false);
  const [optionList,setOption] = useState([
    false,false,false,false
  ])
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
      <motion.div
        animate={{
          opacity: 1,
          transition:{
            delay: 1.0
          }
        }}
        initial={{
          opacity: 0,
          
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 1.0,
          
        }}
      >
      <ThemeProvider theme={darkTheme}>
      <div className="test">
      <InputForms onSubmit={onSubmit} isLoading={isLoading}/>
      </div>
      {isLoading && <BlackOut />}
      {isLoading && <MyLoading />}
      </ThemeProvider>
      </motion.div>
    </div>
  )
}

const InputForms= props => {
  const { register, handleSubmit } = useForm();
  return (
    
    <Container maxWidth="sm" sx={{pt:5}} className="center">
      <Stack spacing= {2}>
      <TextField 
        disabled={props.isLoading}
        label="Protein ID"
        color="secondary"
        //id="outlined-basic"  
        //id="outlined-disabled"
        {...register('protein_id')}
        variant="filled"
        onChange
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
    <motion.div
        animate={{
          opacity: 1,
          transition:{
            delay: 1.0
          }
        }}
        initial={{
          opacity: 0,
          
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 1.0,
          
        }}
      >
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
    </motion.div>
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
      <Container maxWidth="sm" sx={{pt:5}} className="center">
        <Stack spacing= {2}>
          {/*<Button component="label" disabled={props.isLoading}>
            <input
              disabled={props.isLoading}
              className="inputFileBtnHide"
              type="file"
              onChange={props.handleFileUpload}
            />
          </Button>*/}
          <label >
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
  //const pageID = Math.random();
  //onsole.log(pageID)
  //console.log("Pagedasda")
  const { state } = useLocation();
  const [isLoading,setLoading] = useState(false);
  const [layoutChangeFlag,setLayoutChangeFlag] = useState(false);
  const [nodeNum,setNodeNum] = useState(0);
  const [isNumberLoading,setNumberLoading] = useState(false);
  //const [proteinPosition,setProteinPosition] = useState(null);
  //console.log(useLocation())
  const [proteinInfo,setProteinInfo] = useState(null);
  //console.log(proteinInfo)
  const [copyFlag,setCopyFlag] = useState(false);
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
    setNumberLoading(true)
    setCopyFlag(false)
    setProteinInfo(obj.data);
    Axios.get('http://127.0.0.1:5000/getLength',{
    params:{
      target:obj.data.id,
    }})
    .then((response) => {
      setNumberLoading(false)
      //console.log(response)
      if(response.data.state == 0) {
        setNodeNum(Number(response.data.elem))
      }else {
        console.log(response.data.elem);
      }
    });
  };
  const handleCopy = () => {
    setCopyFlag(true)
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
    Axios.post('http://127.0.0.1:5000/deeper_mode',{
      "file":elements,
      "protein_id":proteinInfo.id,
    }).then(response=>{
      setLoading(false);
      //console.log(response.data)
      let re = response.data;
      if(re.state == 0) {
        //navigate("/graph",{ state:{elements:re.elem,proteinList:re.protein_list,proteinTarget:proteinInfo.id} });
        navigate("/graph",{ state:{elements:re.elem,target:proteinInfo.id} });
        setLayoutChangeFlag(!layoutChangeFlag)
      }else {
        console.log(response.data.elem);
      }
    })
  }
  //console.log(state.target)
  return(
  
  //<div>
  <ThemeProvider theme={darkTheme}>
    {/* <GraphDrawing elements={elements} className="center" 
      handleNodeClick={handleNodeClick}
      //proteinList={state.proteinList ? state.proteinList : null}
      //proteinTarget={state.proteinTarget ? state.proteinTarget : null}
      //proteinInfo={proteinInfo}
    /> */}
    <GraphDrawingMemo elements={elements} 
      handleNodeClick={handleNodeClick} 
      changeFlag={layoutChangeFlag}
      target={state.target ? state.target : null}
      />
    <InformationWindow 
      handleSendFile={handleSendFile}
      proteinInfo={proteinInfo}
      isLoading={isLoading}
      comp={elements[0].comp}
      handleSendProtein={handleSendProtein}
      handleCopy={handleCopy}
      copyFlag={copyFlag}
      nodeNum={nodeNum}
      isNumberLoading={isNumberLoading}
    />
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
  const flag = props.proteinInfo!=null;
  const proteinURL =flag ? "https://www.uniprot.org/uniprot/" + props.proteinInfo.id :  'null'
  return(
    <div className="config">
      <Container>
      <Stack>
        <Button variant="outlined" disabled={props.isLoading} startIcon={<BsCloudDownload />} onClick={props.handleSendFile}>
          JSON Download
        </Button>
        <Box sx={{ ...commonStyles, borderRadius: 1 }}>
          
          {/* <Stack>
          <p>Protein Name</p>
          <p>{flag ? props.proteinInfo.name :  'null'}</p>
          <p>Protein ID</p>
          <p>{flag ? props.proteinInfo.id :  'null'}</p>
          
          </Stack> */}
          <List>
            <ListItem>
            <div style={{fontWeight: 'bold',color:"#C83C0B"}}>Name</div>
            </ListItem>
            <ListItem>
            {flag ? props.proteinInfo.name :  'null'}
            </ListItem>
            <ListItem>
            <div style={{fontWeight: 'bold',color:"#C83C0B"}}>ID</div>
            </ListItem>
            <ListItem>
            {flag ? props.proteinInfo.id :  'null'}
            </ListItem>
            <ListItem>
            <div style={{fontWeight: 'bold',color:"#C83C0B"}}>Number of nodes</div>
            </ListItem>
            <ListItem>
            {props.isNumberLoading ? <ReactLoading  type="spin" color="#FFF" height="20px" width="20px"/> : props.nodeNum}
            </ListItem>
            <ListItem>
            <div style={{fontWeight: 'bold',color:"#C83C0B"}}>Uniprot Link</div>
            </ListItem>
            <ListItem>
              <TextField disabled="true" value={proteinURL}/>
              <CopyToClipboard
                text= {proteinURL}
                color="secondary"
                onCopy={props.handleCopy}
              >
              <IconButton>{props.copyFlag ? <BsClipboardCheck color="secondary"/>: <BsClipboardMinus color="#FF9900"/>}</IconButton>
              </CopyToClipboard>
            </ListItem>
            <List>
            </List>
          </List>
        </Box>
        {
          props.proteinInfo!=null && props.comp[props.proteinInfo.name][0] == 1 &&
          <Button variant="outlined" disabled={props.isLoading} color="secondary" startIcon={<BsFillLayersFill />} onClick={props.handleSendProtein}>
          <p>Go deeper from current <span style={{fontWeight: 'bold'}}>{props.proteinInfo.name}</span></p>
          </Button>
        }
      </Stack>
      </Container>
    </div>
  )
}
const GraphDrawing = props => {
  // cleanup cytoscape listeners on unmount
  const cyRef = useRef();
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.removeAllListeners();
        cyRef.current = null;
      }
    };
  }, []);
  const cyCallback = useCallback(
    cy => {
      //if(props.layoutFlag) {
      //}
      // this is called each render of the component, don't add more listeners
      //手動レイアウト
      // if(props.proteinList) {
      //   console.log("SDADASD");
      //   let base_protein = props.proteinTarget ? props.proteinTarget: null
      //   let base_positionX = base_protein ? cy.$('#'+base_protein).position('x') :0;
      //   let base_positionY = base_protein ? cy.$('#'+base_protein).position('y') :0;
      //   let len = props.proteinList.length
      //   props.proteinList.forEach((current,index)=>{
      //     let angle = 2* Math.PI/len * index
      //     let position = {
      //       x:base_positionX + Math.cos(angle)*100,
      //       y:base_positionY + Math.sin(angle)*100,
      //     }
      //     let id_ = '#'+current
      //     console.log(id_)
      //     cy.$(id_).position(position)
      //   })
      // }
      const layout = cy.layout({
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
      });
      layout.run()
      cy.zoomingEnabled( true );
      //console.log(props.target)
      if(props.target) {
        cy.zoom(1)
        let id = '#' + props.target
        cy.zoom({
          level:1.0,
          position:cy.$(id).position()
        })
      }

      if (cyRef.current) return;
      cyRef.current = cy;
      cy.on('click','node',e => {
        //console.log("Click Event (1クリックにつき1メッセージ)")
        props.handleNodeClick(e.target._private)
      })

    },
    [],
  );
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
    // cy={(cy) => { 
    //   cy.layout({
    //     name: 'random'
    //   })
      
    //   cy.on('click','node',e => {
    //     console.log("Click Event (1クリックにつき1メッセージ)")
    //     props.handleNodeClick(e.target._private.data)
    //   })
    // }}
    cy={cyCallback}
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
        'width': '50px',
        'height': '50px',
        'font-size': '22px'
      }
    },
    //  
    {
      selector:'.pydata',
      style: {
        'display': 'none'
      }
    },
    {
      selector:':selected',
      style: {
        'border-color': '#BD3333',
        'border-width': 10,
        'border-opacity': 0.5
      }
    }
  ]}
  />;
};
const GraphDrawingMemo = React.memo(
  ({elements,handleNodeClick,target}) => {
  return <GraphDrawing className="center" 
    elements={elements}
    handleNodeClick={handleNodeClick}
    target={target}
  />
},
(prevProps, nextProps)=>{
  //console.log(JSON.stringify(prevProps.elements) == JSON.stringify(nextProps.elements))
  //return JSON.stringify(prevProps.elements) == JSON.stringify(nextProps.elements)
  //console.log(prevProps.changeFlag == nextProps.changeFlag)
  return prevProps.changeFlag == nextProps.changeFlag
}

);
export default MyApp ;

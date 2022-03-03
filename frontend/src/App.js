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
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import ListSubheader from '@mui/material/ListSubheader';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {motion ,AnimatePresence} from "framer-motion";
import { FixedSizeList } from 'react-window';
Cytoscape.use(COSEBilkent);
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
  return(
    <div className="center">
    <ThemeProvider theme={darkTheme}>
      <motion.div
        animate={{
          y: 0,
          opacity: 1,
          transition:{
            duration: 1.0,
          }
        }}
        initial={{
          y: 50,
          opacity: 0,
        }}
        exit={{
          opacity: 0,
          transition:{
            duration: 0.5,
          }
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
          >
            Create From JSON file
          </Button>
        </Stack>
      </Stack>
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
    }} />
  )
}
const bioList =
  {
    'Mammal':['HUMAN', 'PONPY', 'HYLLA', 'SAGFU', 'MACFA', 'MACMU', 'PANTR', 'HORSE', 'PIG', 'BOVIN', 'CANFA', 'URSAR', 'FELCA', 'PANTI', 'BALMU', 'KOGSI', 'CEPEU', 'ORCOR', 'RABIT', 'MOUSE', 'CRIGR', 'MESAU', 'MACGI', 'SARHA', 'PHACI',],
    'Reptiles':['LACVV', 'PODMU', 'LACBL', 'IGUIG', 'TERCA', 'CHEMY', 'APAFE', 'ALLMI', 'ALLSI', 'CRONI', 'CAICR', 'BOACO', 'PYTSE', 'OPHHA',],
    'Birds':['CHICK', 'CORBR', 'VIRLA', 'AQUCH', 'APTPA', 'EUDCH',],
    'Amphibian':['XENLA', 'RANNI', 'RANSI',],
    'Fishes':['SALSA', 'SCOSC', 'CARAU', 'BRARE', 'CYPCA', 'ANGRO', 'LEPSP', 'PRIGL', 'PASSE',],
    'Arthropod':['DROME', 'ANOQU', 'ARTSF',],
    'Plant':['ORYSA', 'SOLTU', 'HORVU', 'MAIZE', 'PEA', 'PHYPA', 'LYCES', 'CUCSA', 'ARATH', 'SPIOL'], 
    'Eucaryote':['YEAST', ],
    'Prokaryote':['ECOLI', 'ECO57', 'SALTY', 'SALTI', 'VIBCH', 'HELPY', 'BACSU', 'ERWCT', 'HAES1'],
  }
const initialOption = Object.keys(bioList).map((key)=> bioList[key].map(()=>false))
const initialAllCheckList = Object.keys(bioList).map(()=>false)
const Option = React.memo(() => {
  const [optionList,setOption] = useState(initialOption)
  const [allCheckList,setAllCheckList] = useState(initialAllCheckList)
  const handleChange = (props) => {
    const child_index = props.child_index
    const parent_index = props.parent_index
    setOption(optionList.map( (value ,parent_index_map) =>  parent_index_map == parent_index ? value.map((bool,child_index_map)=>child_index_map==child_index ? !bool : bool) : value))
  }
  const handleAllCheck = parent_index => {
    console.log(parent_index)
    setOption(optionList.map( (value ,parent_index_map) =>  parent_index_map == parent_index ? value.map((bool)=>!allCheckList[parent_index]) : value))
    setAllCheckList(allCheckList.map((value,index) => index==parent_index ? !value : value))

  }
  return (
    <div>
      <Box>
        <p style={{color:'#fff'}}>Except for:</p>
        <List
          sx={{
            width: '100%',
            height:400,
            maxWidth: 360,
            bgcolor: 'background.paper',
            overflow: 'auto',
            '& ul': { padding: 0 },
          }}
          subheader={<li />}
        >
          {Object.keys(bioList).map((key,parent_index) => (
            <ul>
            <ListSubheader style={{color:"#F90"}}>{key} <Checkbox onChange={()=>handleAllCheck(parent_index)}/></ListSubheader>
            {bioList[key].map((value,index)=>(
              <BioListRow text={value} index={index} handleChange={handleChange} parent_index={parent_index} flag={optionList[parent_index][index]}/>
            ))}
            </ul>
          ))}
        </List>
      </Box>
    </div>
  );
})
const BioListRow = props => {
  const {text,index,handleChange,parent_index,flag} = props;
  //console.log(parent_index)
  return (<ListItem key={index} component="div" disablePadding>
            <ListItemButton role={undefined} dense>
              <ListItemText>
                    <p style={{color:"#FFF"}}>{text}</p>
              </ListItemText>
              <ListItemIcon>
                  <Checkbox
                    edge="start"
                    //checked={checked.indexOf(value) !== -1}
                    disableRipple
                    checked={flag}
                    onChange={()=> handleChange({child_index:index,parent_index:parent_index})}
                    //inputProps={{ 'aria-labelledby': labelId }}
                  />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>)
}
const From_ProteinID = () => { 
  console.log("pri") 
  const navigate = useNavigate();
  const [isLoading,setLoading] = useState(false);
  const [proteinID,setProteinID] = useState(null)
  const [depth,setDepth] = useState(0)
  //console.log(optionList)
  const handleSetProteinID = e => {
    const eID = e.target.value;
    setProteinID(eID);
  }
  const handleSetDepth = e => {
    const eDepth = e.target.value;
    setDepth(eDepth);
  }
  const [ error, setError ] = useState(null);
  const onSubmit = (data) => {
    setLoading(true)
    Axios.get('http://127.0.0.1:5000/protein_id',{
    params:{
      target:proteinID,
      depth:depth ? depth : 0,
    }})
    .then((response) => {
      setLoading(false)
      if(response.data.state == 0) {
        navigate("/graph",{ state:{elements:response.data.elem} });
      }else {
        console.log(response.data.elem);
        setError({data:response.data.elem})
      }

    });
  };
  return(
    <div>
      <motion.div
        animate={{
          opacity: 1,
          transition:{
            delay: 0.5
          }
        }}
        initial={{
          opacity: 0,
          
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 0.5,
        }}
      >
      <ThemeProvider theme={darkTheme}>
      <Option />
      <InputForms 
        onSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
        handleSetProteinID={handleSetProteinID}
        handleSetDepth={handleSetDepth}
        flag={proteinID}
        cautionFlag={depth>=2}
      />
      {isLoading && <BlackOut />}
      {isLoading && <MyLoading />}
      </ThemeProvider>
      </motion.div>
    </div>
  )
}

const InputForms= props => {
  return (
    <Container maxWidth="sm" sx={{pt:5}} className="center">
      <Stack spacing= {2}>
      <TextField 
        error={props.error}
        helperText={props.error ? props.error.data.error_message:null}
        disabled={props.isLoading}
        label="Protein ID"
        color="secondary"
        variant="filled"
        onChange={props.handleSetProteinID}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
          disabled={props.isLoading}
          label="Depth"
          color="secondary"
          onChange={props.handleSetDepth}
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
      />
      {props.cautionFlag ? <p style={{color:"#F90"}}>Caution: May take some time to analyze</p> : <p> </p>}
      <Button 
        disabled={props.isLoading || !props.flag}
        onClick={props.onSubmit}
        variant="contained"
      >Create a Graph</Button>
      </Stack>
    </Container>
  );
}

const From_JSONFILE = () => {  
  const [file,setFile] = useState(null);
  const [ error, setError ] = useState(null);
  const [depth,setDepth] = useState(0);
  const [isLoading,setLoading] = useState(false);
  const navigate = useNavigate();
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
    params.append('depth', depth ? depth : 0);
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
        setError({data:response.data.elem})
      }
    });
  };
  return(
    <motion.div
        animate={{
          opacity: 1,
          transition:{
            delay: 0.5
          }
        }}
        initial={{
          opacity: 0,
          
        }}
        exit={{
          opacity: 0,
        }}
        transition={{
          duration: 0.5,
          
        }}
      >
    <ThemeProvider theme={darkTheme}>
      <FileInputForm 
        handleFileUpload={handleFileUpload}
        handleDepth={handleDepth}
        onSubmit={onSubmit}
        isLoading={isLoading}
        error={error}
        flag={file}
        cautionFlag={depth>=2}
      />
      {isLoading && <BlackOut />}
      {isLoading && <MyLoading />}
    </ThemeProvider>
    </motion.div>
  )
}

const FileInputForm = props => {
  return (
      <Container maxWidth="sm" sx={{pt:5}} className="center">
        <Stack spacing= {2}>
          <label >
            <Input accept="application/json" multiple type="file" onChange={props.handleFileUpload} />
            <Button 
            variant="contained"
            component="span"
            color="secondary"
            startIcon={<BsCloudUpload />}
            disabled={props.isLoading}
            error={props.error}
            helperText={props.error ? props.error.data.error_message:null}
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
              error={props.error}
            helperText={props.error ? props.error.data.error_message:null}
          />
          {props.cautionFlag ? <p style={{color:"#F90"}}>Caution: May take some time to analyze</p> : <p> </p>}
          <Button 
            disabled={props.isLoading || !props.flag}
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
  const [layoutChangeFlag,setLayoutChangeFlag] = useState(false);
  const [nodeNum,setNodeNum] = useState(0);
  const [NumberLoading,setNumberLoading] = useState(false);
  //const [proteinPosition,setProteinPosition] = useState(null);
  //console.log(useLocation())
  const [proteinInfo,setProteinInfo] = useState(null);
  const [response,setResponse]=useState(null)
  //console.log(proteinInfo)
  const [copyFlag,setCopyFlag] = useState(false);
  const elements = JSON.parse(state.elements)
  const protein_name = elements[1].data.name
  const navigate = useNavigate();
  const ref = React.useRef(null);
  //console.log(ref)
  ref.current = proteinInfo
  const handleSendFile = () => {
    const blob = new Blob([state.elements], {
      type: 'application/json'
    });
    const filename = protein_name+".json";
    saveAs(blob, filename);
  }
  const handleNodeClick = obj => {
    setNumberLoading(true);
    setCopyFlag(false)
    setProteinInfo(obj.data);
    Axios.get('http://127.0.0.1:5000/getLength',{
    params:{
      target:obj.data.id,
    }})
    .then((response) => {
      if(response.data.state == 0) {
        setNodeNum(Number(response.data.elem))
        if(ref.current && ref.current.id==response.data.target) {
          setNodeNum(Number(response.data.elem))
          setNumberLoading(false)
        }
      }else {
        console.log(response.data.elem);
      }
    });
  };
  const handleCopy = () => {
    setCopyFlag(true)
  }
  const handleSendProtein = () => {
    setLoading(true);
    Axios.post('http://127.0.0.1:5000/deeper_mode',{
      "file":elements,
      "protein_id":proteinInfo.id,
    }).then(response=>{
      setLoading(false);
      let re = response.data;
      if(re.state == 0) {
        navigate("/graph",{ state:{elements:re.elem,target:proteinInfo.id} });
        setLayoutChangeFlag(!layoutChangeFlag)
      }else {
        console.log(response.data.elem);
      }
    })
  }

  return(
  
  //<div>
  <ThemeProvider theme={darkTheme}>
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
      isNumberLoading={NumberLoading}
      cautionFlag={nodeNum>20 && !NumberLoading}
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
            {props.cautionFlag ? <p style={{color:"#F90"}}>Caution: May take some time to analyze</p> : <p> </p>}
            </ListItem>
            <ListItem>
            <div style={{fontWeight: 'bold',color:"#C83C0B"}}>Uniprot Link</div>
            </ListItem>
            <ListItem>
              <TextField disabled value={proteinURL}/>
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
      // cy.zoom(0); 
      // console.log(props.target)
      // cy.zoom({
      //   level:10.0,
      //   position:{
      //     x:100,y:100
      //   }
      // })
      if(props.target) {
        let id = '#' + props.target
        console.log(id)
        cy.zoomingEnabled()
        cy.zoom({
          level:1.0,
          position:cy.$(id).position()
        })
      }
      if (cyRef.current) return;
      cyRef.current = cy;
      cy.on('click','node',e => {
        props.handleNodeClick(e.target._private)
      })

    },
    [],
  );
  //const elements = JSON.parse(props.elements)
  const elements = props.elements
  return <CytoscapeComponent
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
    return prevProps.changeFlag == nextProps.changeFlag
  }
);
export default MyApp ;

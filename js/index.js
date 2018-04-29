class GameOfLife extends React.Component {
    render() {
        return (
            <div>
            <Settings/>
            </div>
        )
    }
}

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            generations: 0,
            clear: false,
            shuffle: false,
            play: true,
            paused: false,
            seed: false
        }
        this.handleStart = this.handleStart.bind(this);
        this.handlePause = this.handlePause.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleRandom = this.handleRandom.bind(this);
    }

    handleStart() {
        if (this.state.play === false && this.state.clear === false) {
            clearInterval(this.nextGeneration);
            this.setState({clear: false, play: true, paused: false});
            this.nextGeneration = setInterval(()=>{
                this.setState({generations: this.state.generations+1});
            }, 100);
        } else if (this.state.clear) {
            var cells = document.getElementsByClassName('cell');
            var seeded = Array.prototype.some.call(cells, (cell)=>{
                return cell.className.toString().includes('alive');
            });

            if (seeded) {
                this.setState({seed: true, clear: false, play: true, paused: false});
                this.nextGeneration = setInterval(()=>{
                    this.setState({generations: this.state.generations+1});
                }, 100);
            }

        }
    }

    handlePause() {
        if (this.state.clear === false) {
        clearInterval(this.nextGeneration);
        this.setState({paused: true, play: false, generations: this.state.generations, seed: false});
        }
    }

    handleRandom() {
        this.setState({generations: 0, clear: false, shuffle: true, paused: false, seed: false});
        clearInterval(this.nextGeneration);
        this.nextGeneration = setInterval(()=>{
            this.setState({generations: this.state.generations+1});
        }, 100);
    }

    handleClear() {
        this.setState({generations: 0, clear: true, shuffle: false, paused: false, play: false, seed: false});
        var cells = document.getElementsByClassName('cell');
        Array.prototype.forEach.call(cells, (cell)=>{
            if (cell.className.includes('alive')) {
                cell.className.slice(0,5) + "dead";
                cell.style.background = "black";
            }
        });
        clearInterval(this.nextGeneration);
    }

    componentDidMount() {
        this.nextGeneration = setInterval(()=>{
            this.setState({generations: this.state.generations+1});
        }, 100);
        this.setState({clear: false, play: true});
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="panel">
                    <div className="generations">
                      <span>Generations:</span>
                      <span>{this.state.generations}</span>
                    </div>
                    <div className="buttons">
                      <button className="btn btn-primary" onClick={this.handleStart}>►</button>
                      <button className="btn btn-warning" onClick={this.handlePause} style={    {color:"white"}}>❙❙</button>
                      <button className="btn btn-danger" onClick={this.handleClear}><i className="fa    fa-trash-o"></i></button>
                      <button className="btn btn-success" onClick={this.handleRandom}><i className="fa  fa-random"></i></button>
                    </div>
                </div>
                <div className="board">
                <Board generations={this.state.generations} clear={this.state.clear} shuffle={this.state.shuffle} paused={this.state.paused} seed={this.state.seed}/>
                </div>
            </div>
        )
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(e) {
        let className = e.target.className;
        className.includes('alive') ? 
        (e.target.className = className.slice(0,5) + "dead", e.target.style.background = "black") : 
        (e.target.className = className.slice(0,5) + "alive", e.target.style.background = "#16DB93");
    }

    render() {
        let board = [];
        let boardWidth = 60; 
        let boardHeight = 40; 
        
        for (let h=0; h<boardHeight; h++) {
            let row = [];
            for (let w=0; w<boardWidth; w++) {
                row.push(<Cell 
                        id={(w+((h+1)*boardWidth))-(boardWidth-1)} 
                        onClick={this.handleClick}
                        generations={this.props.generations}
                        clear={this.props.clear}
                        shuffle={this.props.shuffle}
                        paused={this.props.paused}
                        seed={this.props.seed}
                        />)
            } 
            board.push(<tr>{row}</tr>)
        }
        return <table><tbody>{board}</tbody></table>;
    }  
}

class Cell extends React.Component {
    constructor(){
        super();
        this.state = {status: ""};
    }

    componentWillReceiveProps(nextProps) {
        let id = Number(this.props.id);
        let cellClass = document.getElementById(this.props.id).className;
        var neighbors;
        if (62 <= id && id <= 2339 && (id%60!==1) && (id%60!==0)) {
            neighbors = [id+1, id-1, id+59, id+60, id+61, id-59, id-60, id-61];
        } else if (id === 1) {
            neighbors = [id+1, id+60, id+61];
        } else if (id === 60) {
            neighbors = [id-1, id+59, id+60];
        } else if (id === 2341) {
            neighbors = [id+1, id-59, id-60];
        } else if (id === 2400) {
            neighbors = [id-1, id-60, id-61];
        } else if (2 <= id && id <= 59) {
            neighbors = [id-1, id+1, id+59, id+60, id+61];
        } else if (2342 <= id && id <= 2399) {
            neighbors = [id-1, id+1, id-59, id-60, id-61];
        } else if (id % 60 === 1 && id !== 1 && id !== 2341) {
            neighbors = [id-60, id-59, id+1, id+60, id+61];
        } else if (id % 60 === 0 && id !== 60 & id !== 2400) {
            neighbors = [id-60, id-61, id-1, id+59, id+60];
        }

        let liveNeighbors = neighbors.filter(neighbor=>document.getElementById(neighbor).className.indexOf("alive") > 1).length;
        let paused = this.props.paused;

        if (paused === false && cellClass.includes("alive") && liveNeighbors < 2 
        || paused === false && cellClass.includes("alive") && liveNeighbors > 3 
        || this.props.clear) {
            this.setState({status: "dead"});
        } else if (paused === false && cellClass.includes("alive") && liveNeighbors === 2 
        || paused === false && cellClass.includes("alive") && liveNeighbors === 3 
        || paused === false && cellClass.includes("dead") && liveNeighbors === 3) {
            this.setState({status: "alive"});
        } else if (paused === false && cellClass.includes("dead") && liveNeighbors !== 3) {
            this.setState({status: "dead"});
        } else if (paused && cellClass.includes("alive")) {
            this.setState({status: "alive"});
        } else if (paused && cellClass.includes("dead")) {
            this.setState({status: "dead"});
        }
    }  

    render() {
        var status;
        if (this.props.clear) {
            status = "dead";
        } else if (this.props.shuffle && this.props.generations===0 
        || this.props.generations===0 && this.props.seed===false) {
            status = (Math.random() > .7 ? "alive" : "dead");
        } else if (this.props.generations > 0 
        || this.props.paused 
        || (this.props.generations === 0 && this.props.seed)) {
            status = this.state.status;
        }

        return (
            <td 
            className={"cell "+status} 
            id={this.props.id} 
            onClick={this.props.onClick}
            style={{background: (status === "alive" ? "#16DB93" : "black")}}>
            </td>
        )
    }
}

ReactDOM.render(<GameOfLife/>, document.getElementById('root'));
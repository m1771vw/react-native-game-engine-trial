import React, { PureComponent } from "react";
import { Dimensions, AppRegistry, StyleSheet, StatusBar, Text, View, Platform, Modal, ImageBackground } from "react-native";
import { GameEngine } from "react-native-game-engine";
import * as Animatable from 'react-native-animatable';
import Systems from "./components/Systems";
import LevelOne from './components/Levels/level-1';
import LevelTwo from './components/Levels/level-2';
import LevelThree from './components/Levels/level-3';
import LevelFour from './components/Levels/level-4';
import GameOver from './components/GameOver';
import NextLevel from './components/NextLevel';
import EStyleSheet from "react-native-extended-stylesheet";
import Title from './components/Menus/Title';
import LevelTitle from './components/Levels/level-title';
const STARTINGLIVES = 5
const STARTINGTRAMPOLINES = 5
const BOXREMOVELIMIT = 5

const defaultTheme = {
  $bouncyBoxMenuMaxWidth: 500,
  $bouncyBoxMenuFont: Platform.OS === "ios" ? "Futura-CondensedExtraBold" : "normal",
  $bouncyBoxMenuBackgroundColor: "#fffddd",
  $bouncyBoxMenuPrimaryColor: "#66f6cb",
  $bouncyBoxMenuSecondaryColor: "#0bb482"
};

Animatable.initializeRegistryWithDefinitions({
  fadeInOut: {
    0: { opacity: 0 },
    0.25: { opacity: 1 },
    1: { opacity: 0 }
  }
});

export default class App extends PureComponent {
  state={
    score: 0,
    removedBoxes: 0,
    trampolines: STARTINGTRAMPOLINES,
    lives: STARTINGLIVES,
    gameIsRunning: true,
    gameOver: false,
    levelBeat: false,
    currentLevel: 'level-title',
    titleVisible: true,
    showTitle: true,
    showAddScoreAnimation: false,
    showLoseLifeAnimation: false,
    showNoTrampolineAnimation: false
  };
  
  async componentWillMount() {
    await EStyleSheet.build(Object.assign({}, defaultTheme, this.props.theme));
    await Expo.Font.loadAsync({
        'FontAwesome': require('./components/assets/fontawesome-webfont.ttf'),
      });
  };

  startGame = () => {
    this.setState({
      gameIsRunning: true,
      showTitle: false,
      currentLevel: 'level-1'
    }, this.restart);
  };

  onPlayGame = () => {
    this.setState({
      titleVisible: false,
    });
  };

  nextLevel = () => {
    this.turnOffText();
    switch(this.state.currentLevel) {
      case 'level-1':
      this.refs.engine.swap(LevelTwo());
      setTimeout(() => {
        this.resetState('level-2');
      }, 1000);
        break;
      case 'level-2':
      this.refs.engine.swap(LevelThree());
      setTimeout(() => {
        this.resetState('level-3');
      }, 1000);
      break;
      case 'level-3':
      this.refs.engine.swap(LevelFour());
      setTimeout(() => {
        this.resetState('level-4');
      }, 1000);
      break;      
      case 'level-4':
      this.refs.engine.swap(LevelOne());
      setTimeout(() => {
        this.resetState('level-1');
      }, 1000);
      break;
      default:
      this.refs.engine.swap(LevelOne());
      setTimeout(() => {
        this.resetState('level-1');
      }, 1000);
      break;
    }
  };

  turnOffText = () => {
    this.setState({
      gameOver: false,
      levelBeat: false
    })
  };

  resetState = (level) => {
    this.setState({
      currentLevel: level, 
      gameIsRunning: true,
      gameOver: false,
      levelBeat: false, 
      trampolines: STARTINGTRAMPOLINES, 
      lives: STARTINGLIVES,
      removedBoxes: 0,
      score: 0
      });
  };

  getLevelFromState = () => {
    switch(this.state.currentLevel){
      case 'level-1':
        return LevelOne()
      case 'level-2':
        return LevelTwo()
      case 'level-3':
        return LevelThree()
        case 'level-4':
        return LevelFour()
    }
  };

  restart = () => {
    this.refs.engine.swap(this.getLevelFromState())
    this.turnOffText();
    setTimeout(() => {
      this.resetState(this.state.currentLevel);
    }, 1000);
  };

  quit = () => {
      this.setState({
        gameIsRunning: false,
        gameOver: false,
      });
  };

  gameOver = () => {
    this.setState({
      gameIsRunning: false
    });
  };

  increaseScore = () => {
      this.setState({
        showAddScoreAnimation: false
      }, () => {this.setState({
        score: this.state.score + 1,
        showAddScoreAnimation: true
      })});
  };

  increaseTrampolines = () => {
    this.setState({
      trampolines: this.state.trampolines + 1
    });
  };

  decreaseTrampolines = () => {
    this.setState({
      trampolines: this.state.trampolines - 1
    });
  };

  decreaseLives = () => {
    this.setState({
      showLoseLifeAnimation: false
    }, () => {this.setState({
      lives: this.state.lives - 1,
      showLoseLifeAnimation: true
    })}, this.checkIfGameOver);
  };

  levelBeat = () => {
    this.setState({
      levelBeat: true,
      gameIsRunning: false
    });
  };

  removeBox = () => {
    this.setState({
      removedBoxes: this.state.removedBoxes + 1
    }, this.checkIfGameOver)
  }

  checkIfGameOver = () => {
    this.state.lives !== 0 && this.state.score === BOXREMOVELIMIT
    ? this.setState({
      levelBeat: true,
      gameIsRunning: false
    }): this.state.lives <= 0
    ? this.setState({
      gameOver: true,
      gameIsRunning: false
    })
    : this.setState({
      gameIsRunning: true
    })
  }

  addScoreAnimationDisappear = () => {
    this.setState({
      showAddScore: false
    })
  }

  showLoseLifeAnimationDisappear = () => {
    this.setState({
      showLoseLifeAnimation: false
    })
  }

  showNoTrampolineAnimation = () => {
    this.setState({
      showNoTrampolineAnimation: false
    }, () => {this.setState({
      showNoTrampolineAnimation: true
    })})
  }

  showNoTrampolineAnimationDisappear = () => {
    this.setState({
      showNoTrampolineAnimation: false
    })
  }

  handleEvent = ev => {
    if(this.state.showTitle) return;
    switch (ev.type) {
      case "increase-trampolines":
        this.increaseTrampolines();
        break;
      case "increase-score":
        this.increaseScore();
        break;
      case "decrease-trampolines":
        this.decreaseTrampolines();
        break;
      case 'not-enough-trampolines':
        this.showNoTrampolineAnimation();
        break;
      case "decrease-lives":
        this.decreaseLives();
        break;
      case "game-over":
        this.gameOver();
        break;
      case "level-beat":
        this.levelBeat();
        break;
      case "remove-box":
        this.removeBox();
        break;
      case "start-game":
        this.startGame();
        break;
    }
  };

  quit = () => {
    this.refs.engine.swap(LevelTitle());
    setTimeout(() => {
      this.resetState('level-1');
    }, 1000);
    this.setState({
      gameIsRunning: false,
      gameOver: false,
      levelBeat: false,
      titleVisible: true,
      showTitle: true,
      currentLevel: 'level-title'
    });
  };

  render() {
    let {container, scoreFont, scoreContainer, endMessage, addScore} = styles
    let {gameIsRunning, score, lives, trampolines} = this.state
    return (
      <GameEngine 
        ref={'engine'}
        onEvent={this.handleEvent}
        running={gameIsRunning}
        style={styles.container} 
        systems={Systems} 
        entities={LevelTitle()}> 

        <StatusBar hidden={true} />

        {!this.state.showTitle && (
          <View style={scoreContainer}>
            <Text style={scoreFont}>Score: {score} / {BOXREMOVELIMIT} </Text>
          {this.state.showAddScoreAnimation &&
              <Animatable.Text 
                useNativeDriver
                style={styles.addScore}
                animation={'fadeInOut'}
                onAnimationEnd={this.addScoreAnimationDisappear}
                >+1</Animatable.Text>}
          <Text style={scoreFont}>Lives: {lives}</Text>
          {this.state.showLoseLifeAnimation &&
            <Animatable.Text 
              useNativeDriver
              style={styles.loseLife}
              animation={'fadeInOut'}
              onAnimationEnd={this.showLoseLifeAnimationDisappear}
              >-1</Animatable.Text>}
          <Text style={scoreFont}>Trampolines Left: {trampolines}</Text>
          {this.state.showNoTrampolineAnimation &&
            <Animatable.Text 
              useNativeDriver
              style={styles.noTrampoline}
              animation={'fadeInOut'}
              onAnimationEnd={this.showNoTrampolineAnimationDisappear}
              >No Trampolines Left!</Animatable.Text>}
        </View>
      )}

      {this.state.showTitle &&
        <Title startGame={this.startGame} titleVisible={this.state.titleVisible} onPlayGame={this.onPlayGame}/>
      }
      <View style={endMessage}>
        {this.state.gameOver && ( 
            <GameOver onPlayAgain={this.restart} nextLevel={this.nextLevel}  onQuit={this.quit} />
          )}
          {this.state.levelBeat && (
              <NextLevel onPlayAgain={this.restart} nextLevel={this.nextLevel}  onQuit={this.quit}/>
          )}
        </View>
      </GameEngine>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  scoreContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    margin: 25
  },
  scoreFont: {
    fontSize: 24,
    fontFamily: "Futura-CondensedExtraBold"
  },
  addScore: {
    fontSize: 30,
    position: 'absolute',
    marginLeft: 75,
    marginTop: 30,
    color:'green',
    fontFamily: "Futura-CondensedExtraBold"
  },
  loseLife: {
    fontSize: 30,
    position: 'absolute',
    marginLeft: 290,
    marginTop: 30,
    color: 'red',
    fontFamily: "Futura-CondensedExtraBold"
  },
  noTrampoline: {
    fontSize: 30,
    position: 'absolute',
    marginLeft: 150,
    marginTop: 150,
    fontFamily: "Futura-CondensedExtraBold"
  },
  endMessage: {
    alignItems: 'center',
  }
});

AppRegistry.registerComponent("App", () => App);


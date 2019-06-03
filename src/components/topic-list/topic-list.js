import React, {Component}  from 'react';
import axios from 'axios';
import marked from 'marked';

export default class TopicList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: '',
      topicMarkdown: '',
    };
  }

  getRawAwesomeListContent = (readmeUrl) => {
    axios.get(readmeUrl)
    .then((topicMarkdown) => {
      this.setState({
        topicMarkdown: topicMarkdown.data,
        errorMessage: '',
      });

      if (!this.state.topicMarkdown) {
        this.setState({
          errorMessage: `There was an error. Unable to load the Awesome list for ${this.props.clickedTopic}.`
        });
      }
    }).catch((error) => {
      this.setState({
        errorMessage: `There was an error. Unable to load the Awesome list for ${this.props.clickedTopic}. ${error}.`,
        topicMarkdown: ''
      });
    });
  }

  prepareRawAwesomeListRequest = () => {
    if (!this.props.clickedTopic) {
      return;
    }

    const uppercasedReadmeUrl = `https://raw.githubusercontent.com/${this.props.clickedTopic}/master/README.md`;
    const lowercasedReadmeUrl = `https://raw.githubusercontent.com/${this.props.clickedTopic}/master/readme.md`;

    this.getRawAwesomeListContent(uppercasedReadmeUrl, function() {
      if (this.state.errorMessage.includes('404')) {
        this.getRawAwesomeListContent(lowercasedReadmeUrl);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.clickedTopic !== prevProps.clickedTopic) {
      this.prepareRawAwesomeListRequest(prevProps);
    }
  }

  setupCustomMarked() {
    let customMarked = marked;

    customMarked.setOptions({
      breaks: true,
    });

    return customMarked;
  }

  addButtonsToListElements = (parsedMarkdown) => {
    let startingHtmlString = `<li><span><button class="button-default">[Seen]</button><button class="button-default">[<i class="fas fa-star"></i>]</button>`;
    let endingHtmlString = `</span></li>`;

    parsedMarkdown = parsedMarkdown
      .replace(/<li>/g, startingHtmlString)
      .replace(/<\/li>/g, endingHtmlString);

    return parsedMarkdown;
  }

  renderTopicList = () => {
    let customMarked = this.setupCustomMarked();

    if (this.state.topicMarkdown) {
      let parsedMarkdown = customMarked(this.state.topicMarkdown);
      parsedMarkdown = this.addButtonsToListElements(parsedMarkdown);

      return (
        <div dangerouslySetInnerHTML={{__html: parsedMarkdown}}></div>
      )
    }
  }

	render() {
    return (
      <div className="topic-list-container">
        {this.renderTopicList()}
      </div>
    );
	}
};

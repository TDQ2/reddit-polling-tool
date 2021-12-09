class Post {
  constructor(id, title, upVotes, downVotes) {
    this.id = id;
    this.title = title;
    this.upVotes = upVotes;
    this.downVotes = downVotes;
    this.changeInUpVotes = 0;
    this.changedInDownVotes = 0;
  }
}

//set the change in UpVotes
Post.prototype.calcChangeInUpVotes = (prevUpVotes) => {};

//set the change in DownVotes
Post.prototype.calcChangeInUpVotes = (prevUpVotes) => {};

module.exports = Post;

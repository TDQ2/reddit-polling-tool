class Post {
  constructor(id, title, upVotes, downVotes) {
    this.id = id;
    this.title = title;
    this.upVotes = upVotes;
    this.downVotes = downVotes;
    this.changeInUpVotes = 0;
    this.changeInDownVotes = 0;
  }
}

//calculates and sets the change in upVotes and downVotes compared to the same post from the previous run
Post.prototype.calcAndSetChangeInVotes = function (prevUpVotes, prevDownVotes) {
  this.changeInUpVotes = this.upVotes - prevUpVotes;
  this.changeInDownVotes = this.downVotes - prevDownVotes;
};

module.exports = Post;

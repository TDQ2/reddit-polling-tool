# reddit polling tool

# How to Install
`npm i -g`  
or if permission needed:  
`sudo npm i -g` 

How to uninstall:   
In the root directory -   
`cd /usr/local/bin`  
`rm reddit`

# Intro

A command line tool to gather data from reddit

Features:
* On each run - prints the following
  * New posts from the last execution
  * Posts that are no longer within the top number of specificed posts, and
  * Posts that had a vote count change and by how much.
* run 'prev' to see the results of the last call
* run 'summary' to see a summary of the last call
* run 'clear' to clear the previous results

# Available Commands
In the terminal enter  
`reddit`  

followed by one of the following commands   
`run [subreddit] [numPosts]` - poll reddit posts.  
`clear` - clear previous run.  
`prev` - print results of the previous run.  
`summary` - provides a summary of the last run.  


# Example
`reddit run popular 5` - pulls the top 5 posts from the r/popular subreddit  
`reddit run popular 5` - pulls the top 5 posts from the r/popular subreddit and compares against the first run  
`prev` - prints the results of the last run  
`summary` - summarizes results of the last run  
`clear` - clears the results of the last run

# Notes
subreddit and numPosts are optional  
subreddit is 'popular' by default  
numPosts is 75 by default  
A new run with a different subreddit or numPosts submitted will clear the previous run and return results without comparison   

# Considerations and Limitations
* There is likely room for time and space optimizations
  * The posts of each run are stored in a js object for faster searching (O(1)) making it faster to compare one run's post IDs against the next (O(n) to compare the posts of one run against all previous posts)
    * However, to print the posts in order of upvote, the object is converted back into an array (O(n)) and sorted ( O(n log(n)) )
  * The posts that falling into the following categories - 'new posts', 'posts that dropped out of the top numPosts' and 'posts with changes in votes' - are all saved in separate objects
    * I believe this benefits readability, but space can be saved by keeping the posts in a single object and tagging them with the noted criteria (e.g. post.isNew = true)
      * However, this space optimization may slightly impact speed of printing given some printing functions will have to loop over the entire posts object instead of shorter category specific object
* Currently the 'reddit.json' file which is used to save the last run is stored in the directory where the terminal execute the command. This may result in unexpected results for users who use commands from within different directories
  * This has been left for the time being to make the json easier to examine in vscode

# Opportunities for Expansion
* Clear places to expand on this project are by expanding the scope of saved data. Currently only one save file is generated and it overwrites the previous version on every run
  * Multiple save files could be created for each subreddit
* Further analytics would be interesting. Some potential ideas include:
  * Analysis around how long posts remain at the top
  * How many posts are shown in the top on a daily average

![alt text](https://i.ibb.co/RgRPk2v/image.png)

## Note-taking Service

Allows you to create your notes in your space

## Features

1. Run Code in the Note! (Currently Support Python / Javascript)
2. Collaborative Editing
3. See differences between different versions

## Techniques

1. Fork processes and use Docker to run different Code Languages.
2. Implement CRDT YATA Algorithm to perform collaborating editing.
3. Implement LCS Algorithm to show the difference between versions.

## Demo

### Collaborating Editing

#### Using doubly linked list data structure to make sure eventual consistency

1. Make sure every person in the team shares the same doubly linked list structure
2. Insertion: Provide detailed node information(including the prev and the next node at the time of insertion) to make sure it will be appended to the same position
3. Deletion: Not Removed directly, but marked that the node has been removed
4. The following is the demo of the structure

<img width="604" alt="image" src="https://user-images.githubusercontent.com/74696199/166108825-3f7bbfb7-f9b3-4b41-ba9e-c2de7f349388.png">

#### Optimization

1. Assume that N represents the total text numbers, and M represents the total blocks in an article. Each blocks has Ti texts (1 <= i <= m), Σ(Ti) = N
2. It would be time-consuming when the N is large. Each operation(Insert/Delete) would be O(N)
3. What I do: Also put blocks into a doubly linked list, which can speed up the process
4. New structure as below
5. In this way, each operation would be O(Ti + M). In most cases, O(N) >> O(Ti + M), is much faster than before.

<img width="602" alt="image" src="https://user-images.githubusercontent.com/74696199/166108947-5e6d62a9-a010-4c9c-bf66-4ebe6a26fe81.png">

#### Garbage Collection

1. To assure Eventual Consistency, even when a user deletes a text, it will not be removed directly.
2. It will lead to a waste of memory resources and slow down each operation due to the garbage it's cumulated.
3. What I do: Use a Garbage collector to throw the garbage, follow the [YATA Algorithm essay](https://www.researchgate.net/publication/310212186_Near_Real-Time_Peer-to-Peer_Shared_Editing_on_Extensible_Data_Types) says, not removing it directly, but using a buffer to make sure it won't lead to inconsistency.
4. Example Below

<img width="756" alt="image" src="https://user-images.githubusercontent.com/74696199/166109661-ed80e480-a0f8-4556-8e0c-7b626e7468c9.png">

#### Currently not support

1. Chinese typing
2. command Z

### Version Control

#### You can see the difference between the previous version and the latest version

1. Not recording each version's whole file, but using LCS algorithm to compare the difference and only save differences.

https://user-images.githubusercontent.com/74696199/166094783-6620af3b-9cf3-402b-8a7d-108ede5edbb4.mov

2. Allow users to see the difference between versions

https://user-images.githubusercontent.com/74696199/166094501-2fb7ef30-f770-4220-8520-f3feb45e78e4.mov

### Coding in the Note

#### Can choose coding language from Python/Javascript

https://user-images.githubusercontent.com/74696199/166094559-03715063-2ba9-4339-81e6-ea107039669b.mov

### Auto Saving

1. Using debounce technique
2. Waits for two seconds of inactivity before saving

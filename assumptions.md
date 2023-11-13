1. Duplicate handle strings (names) will not produce string overflow.

The current code handles duplicate names with increasing ints at the end ( for exmaple: johncitizen,johncitizen1,johncitizen2...).
Our code is assuming that we will not be handling with string overflow issues, as we will not be accounting for a enormous amount of 
<<<<<<< assumptions.md
duplicate names in our handle strings that would cause bugs.

2. all the input have correct datatype
No need to test if the parameter have correct datatype in the implementation of function. 

To add onto this point, our iteration1 submission is not typescripted. As such we expect each function to be receiving the correct input.

3. Messages sent will be of appropriate length

Similarly to assumption 1, we expect the same behaviour to occur for messages, namely we expect users of our program will not be sending message strings with enormous lengths

4. Empty intial state

Our code has been implemented with the expectation that the intial state of data is empty ( this includes all the arrays and objects in the code). This can be changed in further iterations where perhaps there are admin accounts in place for initial states. However, this has not been implemented in this iteration for the sake of simplicity and easy tracking of channel members and owners.

5. Users have the same handle string across all channels

Although we have a system in place that accounts for duplicate handle strings. We expect that users will retain the same handle strong across different channels. This is a possible avenue of improvement and scability if the project wants to get more creative( for example, with a 'nickname' function for diffrent channels, similar to what other popular social media chatrooms utilise).

6. Our code does not persist

We are starting 'fresh' each time we run tests and any changes made during the execution of our program will not be saved once the program terminates.

7. There is only ever 1 global owner at one time

A global owner has the same permissions as a channel owner in every channel they're part of, if they add themselves to it. We have made the assumption that there is only 1 for this iteration in order to simplify the tracking of member permissions.
=======
duplicate names in our handle strings.

2. all the input have correct datatype
No need to test if the parameter have correct datatype in the implementation of function.

>>>>>>> assumptions.md
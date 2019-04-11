# Olofi 🔱

## Team

Name: `Olofi`

Members:

- Habib Rehman <habib-ur.rehman@kcl.ac.uk>
- Chow-Ching (Chris) Jim <chow-ching.jim@kcl.ac.uk>
- Oluwafemi (Femi) Oladipo <oluwafemi.oladipo@kcl.ac.uk>
- Spenser Smart <spenser.smart@kcl.ac.uk>
- Akshat Sood <akshat.sood@kcl.ac.uk>
- Salich (Sal) Memet Efenti Chousein <salich.memet_efenti_chousein@kcl.ac.uk>
- Eugene Fong <eugene.fong@kcl.ac.uk>
- Pranav Bheemsetty <pranav.bheemsetty@kcl.ac.uk>

## Development

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

### Setup

Clone the repo

```bash
git clone https://github.kcl.ac.uk/hr/Olofi.git && cd Olofi
```

### Run

```bash
cd mybuddy && npm install && npm start
```

### Test

TBD

## Version Control (Git)

**NEVER** directly push to `master`.
Make sure you know how to use git correctly. Refer to these tutorials https://www.atlassian.com/git/tutorials or just ask in the GC if you need help :)

The Git workflow:

1. Create a branch (named according to the _branch naming convention_ below) for the unit of work you need to do
2. Do the work on the branch and keep pushing your work to it incrementally
3. Only once it has been finished and thoroughly tested (also with the code on `master`), submit a `Pull Request` on GitHub to _merge_ it with `master` (https://help.github.com/articles/creating-a-pull-request/)
4. Let everyone know that your code is ready for review (on our WhatsApp group) and start working on the next thing on Trello
5. We'll review the code and if everything's [_schwifty_](https://www.urbandictionary.com/define.php?term=schwifty) we'll merge it!

### Syncing your branch with the master branch

Whenever you branch out from `master` your new branch is identical to master but your branch does not automatically any new changes made to `master`.

So in order to get the new changes made on `master` (i.e. syncing your branch with `master`), you have to carefully run the following commands

1. Update your local `master` with the remote one

```
$ git checkout master && git pull
```

2. Switch back to your branch (replace the `<YOUR_BRANCH>` with the full name of your branch)

```
$ git checkout <YOUR_BRANCH>
```

3. Rebase `master` onto your branch

```
$ git rebase master
```

If your changes touch the same code as the new changes on `master` do then you may get [merge conflicts](https://www.atlassian.com/git/tutorials/using-branches/merge-conflicts),
you can avoid this by following the version control best practices that is not modifying any code that is not directly related to your work so you will only be ideally editing a single file/unit of code.

### Branch naming convention

Always start with your `first name` followed by `/` and then the `Trello card name` (joined with `-` instead of spaces) which should be a summary of the work that you are doing

```
<first name>/<Trello card name>
```

**Examples:**

```
evilmorty/admin-portal
```

# First result

## What the program does

The program calculates the total weight of three parcels by adding the values
in `weightsGrams`, then prints the total followed by the unit suffix `g`.
This behavior is defined in [`src/index.js:1-4`](../src/index.js#L1-L4).

## Entry point

The executable entry point is `src/index.js`. The `start` script invokes it
with Node.js, as shown by [`package.json:8-10`](../package.json#L8-L10).

## Inputs and units

The entry point contains these three numeric inputs: `125`, `250`, and `425`.
The variable name `weightsGrams` and the output suffix `g` identify the values
and result as grams ([`src/index.js:1-4`](../src/index.js#L1-L4)). Their sum is
`800` grams.

**Bounded source observation:** the inspected entry point reads those
hard-coded values; it does not show command-line, file, environment, or
network input ([`src/index.js:1-4`](../src/index.js#L1-L4)). This is not a claim
about interfaces that are outside the inspected source.

## Start and test commands

Run these commands from the repository root:

```sh
npm start
```

This runs `node src/index.js` ([`package.json:8-10`](../package.json#L8-L10)).

```sh
npm test
```

This runs `node --test test/output.test.js` ([`package.json:8-10`](../package.json#L8-L10)).
The test starts the entry point as a child Node process and asserts that its
trimmed output is `800 g` ([`test/output.test.js:6-11`](../test/output.test.js#L6-L11)).

## Observed local results

These results were observed by running the commands locally in this
repository; they are separate from the source-derived description above.

- `node src/index.js` exited successfully and printed exactly:

  ```text
  800 g
  ```

- `npm test` exited successfully. Node reported 1 test, 1 pass, 0 failures,
  0 cancelled, 0 skipped, and 0 todo tests.

No dependency installation or external service access was used for these
checks.

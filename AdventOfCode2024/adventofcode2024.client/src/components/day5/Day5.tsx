import { Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useAdventInputQuery } from "./query";

type ValidationState = "unknown" | "valid" | "invalid" | "fixed";
type CalculationState = "pending" | "completed"

interface CellModel {
    value: number;
    state: ValidationState;
    isRowValue?: boolean;
    isFixed?: boolean;
}

interface RowModel {
    state: CalculationState;
    cells: CellModel[];
}

class Rule {

    before: number;
    after: number;

    constructor(before: number, after: number) {
        this.before = before;
        this.after = after;
    }

    public fix(values: number[]) {
        const indexOfBefore = values.indexOf(this.before);
        const indexOfAfter = values.indexOf(this.after);

        // If both values are found in the array, swap their positions
        if (indexOfBefore >= 0 && indexOfAfter >= 0) {
            [values[indexOfBefore], values[indexOfAfter]] = [values[indexOfAfter], values[indexOfBefore]];
        }

        return values;
    }

    public isValid(values: number[]) {

        let indexOfBefore = values.findIndex(v => v === this.before);
        let indexOfAfter = values.findIndex(v => v === this.after);

        if (indexOfBefore >= 0 && indexOfAfter >= 0) {
            const result = indexOfBefore < indexOfAfter
            //if (!result) console.log(`${values.join(",")} is invalid because of ${this.before}|${this.after}`);
            return result;
        };

        return true;

    }
}

const parseRule: (line: string) => Rule = (line: string) => {
    const parts = line.split('|'); // Split the string at '|'

    if (parts.length !== 2) {
        throw new Error('Invalid input format. Expected "number|number".');
    }

    // Convert both parts to numbers
    const num1 = parseInt(parts[0], 10); // Base 10
    const num2 = parseInt(parts[1], 10);

    if (isNaN(num1) || isNaN(num2)) {
        throw new Error('Invalid number in input.');
    }

    return new Rule(num1, num2);
}

const parseNumberArray = (input: string): number[] => {
    return input.split(',') // Split the string by commas
        .map((part) => parseInt(part, 10)) // Convert each part to a number
        .filter((num) => !isNaN(num)); // Remove invalid numbers (if any)
};



export const Day5: React.FC = () => {
    const [showInput, setShowInput] = useState<boolean>(true);
    const [input, setInput] = useState<string>();
    const [rules, setRules] = useState<Rule[]>([]);
    const [rows, setRows] = useState<RowModel[]>([]);
    const [isPart2Running, setIsPart2Running] = useState<boolean>();
    const [isPart1Running, setIsPart1Running] = useState<boolean>();
    const [resetTrigger, setResetTrigger] = useState<Date>(new Date());
    const [result, setResult] = useState<number>(0);
    const [speed, setSpeed] = useState<number>(500); // Default to 'Slow'

    const handleSpeedChange = (event: SelectChangeEvent<number>) => {
        setSpeed(event.target.value as number);
    };


    // When input changes, create rules and view models
    useEffect(() => {

        if (input?.length) {
            // Calculate rules

            let phase: "1" | "2" = "1";
            let rules: Rule[] = []
            let rows: RowModel[] = []
            const lines = input.split('\n')

            lines.forEach(l => {
                if (!l.length) {
                    phase = "2";
                    return;
                }

                if (phase == "1") {
                    rules.push(parseRule(l));
                }

                if (phase == "2") {
                    const cellValues = parseNumberArray(l);
                    const cells: CellModel[] = cellValues.map(c => ({
                        state: "unknown",
                        value: c
                    }));

                    rows.push({
                        state: "pending",
                        cells: cells
                    })
                }
            })

            setRules(rules);
            setRows(rows);
        }

    }, [input, resetTrigger]);

    const cancel = useCallback(() => {
        setResetTrigger(new Date());
        setIsPart1Running(false);
        setIsPart2Running(false);
    }, [])


    // Calculate part 1
    useEffect(() => {
        if (!isPart1Running) return;

        let interval: number | null = null;
        interval = window.setInterval(() => {
            setRows(oldRows => {
                const copy = [...oldRows];
                var indexToFix = copy.findIndex(r => r.state === "pending");
                if (indexToFix === -1) {
                    setIsPart1Running(false);
                    return oldRows;
                };

                let rowCopy = { ...copy[indexToFix] };
                let foundInvalid: boolean = false;
                for (let r of rules) {
                    const values = rowCopy.cells.map(c => c.value);
                    if (!r.isValid(values)) {
                        foundInvalid = true;
                    }
                }

                if (!foundInvalid) {
                    let middle = rowCopy.cells[Math.floor(rowCopy.cells.length / 2)];
                    rowCopy = { ...rowCopy, cells: rowCopy.cells.map(c => ({ ...c, isRowValue: c.value === middle.value })) }
                }



                const state: ValidationState = foundInvalid ? "invalid" : "valid";
                rowCopy = { ...rowCopy, cells: rowCopy.cells.map(c => ({ ...c, state: state })) };

                copy[indexToFix] = {
                    ...rowCopy,
                    state: "completed",
                };

                return copy;
            })
        }, speed);

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [isPart1Running, speed, rules]);

    // Calculates
    useEffect(() => {
        const sum = rows.reduce((total, row) => {
            const rowSum = row.cells
                .filter(cell => cell.isRowValue) // Only include cells where isRowValue is true
                .reduce((cellTotal, cell) => cellTotal + cell.value, 0); // Sum cell values in this row
            return total + rowSum; // Add the row's sum to the total
        }, 0);
        setResult(sum);
    }, [rows]);


    // Calculate part 2
    useEffect(() => {
        if (!isPart2Running) return;

        let interval: number | null = null;
        interval = window.setInterval(() => {
            setRows(oldRows => {
                const copy = [...oldRows];
                var indexToFix = copy.findIndex(r => r.state === "pending");
                if (indexToFix === -1) {
                    setIsPart2Running(false);
                    return oldRows;
                };

                let rowCopy = { ...copy[indexToFix] };
                for (let r of rules) {
                    const values = rowCopy.cells.map(c => c.value);
                    if (!r.isValid(values)) {

                        let newValues = r.fix(values);
                        rowCopy = { ...rowCopy, cells: newValues.map(v => ({ isFixed: true, value: v, state: r.after === v || r.before === v ? "fixed" : "unknown" })) };
                        copy[indexToFix] = rowCopy;
                        return copy;
                    }
                    else {
                        rowCopy = { ...rowCopy, cells: rowCopy.cells.map(c => ({ ...c, state: "valid" })) };
                    }
                }

                // At this point we can fuck off and calculate the sum

                const middle = rowCopy.cells[Math.floor(rowCopy.cells.length / 2)];
                rowCopy = { ...rowCopy, cells: rowCopy.cells.map(c => ({ ...c, isRowValue: c.isFixed && middle.value === c.value, state: "valid" })) };



                copy[indexToFix] = {
                    ...rowCopy,
                    state: "completed",
                };
                return copy;
            })
        }, speed);

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [isPart2Running, speed, rules]);

    const startPart1 = useCallback(() => {
        setResult(0);
        setResetTrigger(new Date());
        setIsPart1Running(true);
    }, [])

    const startPart2 = useCallback(() => {
        setResult(0);
        setResetTrigger(new Date());
        setIsPart2Running(true);
    }, [])



    return (
        <div className="flex flex-col space-y-aoc-col">
            <h1 className="text-2xl">Day 5</h1>

            <div className="flex flex-col space-y-aoc-col ">
                <div className="flex flex-row space-x-aoc-row items-center">
                    <h1 className="text-xl">Config</h1>
                    <Button size="small" variant="text" onClick={() => setShowInput(!showInput)} >
                        {showInput && <p>hide</p>}
                        {!showInput && <p>show</p>}
                    </Button>
                </div>

                {showInput &&<FormControl fullWidth>
                    <div className="flex flex-row space-x-aoc-row items-start" >
                    <InputLabel id="speed-select-label">Speed</InputLabel>
                    <Select
                        className="w-[200px]"
                        labelId="speed-select-label"
                        id="speed-select"
                        value={speed}
                        onChange={handleSpeedChange}
                        label="Speed"
                    >
                        <MenuItem value={500}>Slow</MenuItem>
                        <MenuItem value={200}>Medium</MenuItem>
                        <MenuItem value={50}>Fast</MenuItem>
                    </Select>

                    <InputLabel id="input-label"></InputLabel>
                    <TextField label="Input" className="flex flex-grow" id="input-label" multiline rows={5} maxRows={5} value={input} onChange={e => setInput(e.target.value)} />
                    </div>
                    

                </FormControl>}


            </div>

            <div className="flex flex-row space-x-aoc-row items-center">
                <FormControl>

                </FormControl>
                {!isPart1Running && !isPart2Running && <Button variant="contained" color="primary" onClick={startPart1}>Run part 1</Button>}
                {!isPart1Running && !isPart2Running && <Button variant="contained" color="primary" onClick={startPart2}>Run part 2</Button>}
                {(isPart1Running || isPart2Running) && <Button variant="contained" color="secondary" onClick={cancel}>Cancel</Button>}
                <p>Result: {result}</p>
            </div>


            <div className="flex flex-col gap-1">
                {rows.map((row, rowIndex) => (

                    <div key={rowIndex} className={`flex gap-1 bg-green-500'p-1 rounded`}>
                        {row.cells.map((cell, cellIndex) => {

                            const cellClass = cell.state === "fixed" ? "bg-yellow-500" : (cell.state === "invalid" ? "bg-red-500" : (cell.state === "valid" ? "bg-green-600" : "bg-gray-500"));
                            const textClass = cell.isRowValue ? "text-black font-bold" : "text-white";
                            return (
                                <div key={cellIndex} className={`p-1 border ${textClass} rounded text-center ${cellClass}`}>
                                    {cell.value}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
const inputData = document.getElementById("inputData");
const outputData = document.getElementById("outputData");
const duplicateData = document.getElementById("duplicateData");


/* ==================================================
   TOAST
================================================== */

function toast(msg) {

    const div = document.createElement("div");

    div.className = "toast";

    div.innerText = msg;

    document
        .getElementById("toastContainer")
        .appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 2500);
}


/* ==================================================
   NORMALIZE
================================================== */

function norm(v) {

    return v
        .trim()
        .replace(/\s+/g, ' ');
}


/* ==================================================
   RESET WHEN INPUT CHANGES
================================================== */

inputData.addEventListener('input', () => {

    let totalRows = inputData.value
        .split('\n')
        .map(norm)
        .filter(Boolean)
        .length;


    /* Clear previous results */

    outputData.value = "";

    duplicateData.value = "";


    /* KPI */

    document.getElementById("inputRows").innerText =
        totalRows;

    document.getElementById("uniqueRows").innerText =
        0;

    document.getElementById("removedRows").innerText =
        0;


    /* Counts */

    document.getElementById("inputCount").innerText =
        totalRows + " Rows";

    document.getElementById("outputCount").innerText =
        "0 Rows";

    document.getElementById("duplicateCount").innerText =
        "0 Duplicates";

});


/* ==================================================
   FIND DUPLICATES
================================================== */

function processData() {

    let raw = inputData.value;


    if (!raw.trim()) {

        toast("Please enter the duplicate data");

        return;
    }


    /* Get rows */

    let lines = raw
        .split('\n')
        .map(norm)
        .filter(Boolean);


    /*
       Map stores the first occurrence.

       Example:

       ABC
       XYZ
       ABC
       abc

       First ABC = unique
       XYZ = unique
       ABC = duplicate
       abc = duplicate
    */

    let map = new Map();

    let duplicates = [];

    let caseDuplicate = false;


    /* ==================================================
       CHECK EACH ROW
    ================================================== */

    for (let line of lines) {

        /*
           Lowercase key makes duplicate detection
           case-insensitive.
        */

        let key = line.toLowerCase();


        if (map.has(key)) {

            /*
               This is a duplicate row.
               Add the actual entered value to
               duplicateData.
            */

            duplicates.push(line);

            caseDuplicate = true;

        } else {

            /*
               First occurrence is kept.
            */

            map.set(key, line);
        }

    }


    /* ==================================================
       UNIQUE DATA
    ================================================== */

    let unique = [...map.values()];


    /* ==================================================
       SHOW CLEAN DATA
    ================================================== */

    outputData.value =
        unique.join('\n');


    /* ==================================================
       SHOW DUPLICATE DATA
    ================================================== */

    duplicateData.value =
        duplicates.join('\n');


    /* ==================================================
       UPDATE KPI
    ================================================== */

    document.getElementById("inputRows").innerText =
        lines.length;

    document.getElementById("uniqueRows").innerText =
        unique.length;

    document.getElementById("removedRows").innerText =
        duplicates.length;


    /* ==================================================
       UPDATE COUNTS
    ================================================== */

    document.getElementById("inputCount").innerText =
        lines.length + " Rows";

    document.getElementById("outputCount").innerText =
        unique.length + " Rows";

    document.getElementById("duplicateCount").innerText =
        duplicates.length + " Duplicates";


    /* ==================================================
       TOAST
    ================================================== */

    if (duplicates.length === 0) {

        toast("No Duplicate found");

    } else {

        toast(
            duplicates.length +
            " duplicate row(s) found and removed"
        );
    }


    /* Case-insensitive notification */

    if (caseDuplicate) {

        /*
           Only show this message when duplicates
           were detected through case-insensitive
           matching.
        */

        const hasDifferentCase = duplicates.some(dup => {

            return unique.some(original =>
                original.toLowerCase() === dup.toLowerCase() &&
                original !== dup
            );

        });


        if (hasDifferentCase) {

            setTimeout(() => {

                toast(
                    "Case-insensitive duplicate detected (ABC = abc = Abc)"
                );

            }, 300);

        }

    }

}


/* ==================================================
   CLEAR ALL
================================================== */

function clearAll() {

    inputData.value = "";

    outputData.value = "";

    duplicateData.value = "";


    document.getElementById("inputRows").innerText =
        0;

    document.getElementById("uniqueRows").innerText =
        0;

    document.getElementById("removedRows").innerText =
        0;


    document.getElementById("inputCount").innerText =
        "0 Rows";

    document.getElementById("outputCount").innerText =
        "0 Rows";

    document.getElementById("duplicateCount").innerText =
        "0 Duplicates";


    toast("Cleared successfully");
}


/* ==================================================
   COPY CLEAN OUTPUT
================================================== */

function copyOutput() {

    if (!outputData.value) {

        toast("Nothing to copy");

        return;
    }


    navigator.clipboard
        .writeText(outputData.value)
        .then(() => {

            toast("Clean data copied successfully");

        })
        .catch(() => {

            toast("Unable to copy data");

        });
}


/* ==================================================
   COPY DUPLICATES
================================================== */

function copyDuplicates() {

    if (!duplicateData.value) {

        toast("No duplicate data found");

        return;
    }


    navigator.clipboard
        .writeText(duplicateData.value)
        .then(() => {

            toast("Duplicate data copied successfully");

        })
        .catch(() => {

            toast("Unable to copy duplicate data");

        });
}


/* ==================================================
   EXPORT CLEAN DATA TO EXCEL
================================================== */

function exportExcel() {

    if (!outputData.value) {

        toast("No data to export");

        return;
    }


    let data = outputData.value
        .split('\n')
        .map(x => [x]);


    let wb = XLSX.utils.book_new();


    let ws = XLSX.utils.aoa_to_sheet([
        ["Clean Data"],
        ...data
    ]);


    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Clean Data"
    );


    XLSX.writeFile(
        wb,
        "clean-data.xlsx"
    );


    toast("Excel downloaded");
}
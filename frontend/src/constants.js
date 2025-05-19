export const CODE_SNIPPETS = {
  python: `import logging
logging.getLogger('matplotlib.font_manager').setLevel(logging.WARNING)
def greet(name):
\tprint("Hello, " + name + "!")

greet("Alex")
print("Welcome to the program.")

import sys
import os

stderr_fileno = sys.stderr.fileno()
devnull = os.open(os.devnull, os.O_WRONLY)
saved_stderr = os.dup(stderr_fileno)
os.dup2(devnull, stderr_fileno)

import matplotlib.pyplot as plt

os.dup2(saved_stderr, stderr_fileno)
os.close(devnull)
os.close(saved_stderr)

import pandas as pd

# Dummy data
data = {
\t'Name': ['Alice', 'Bob', 'Charlie', 'David'],
\t'Age': [25, 30, 35, 40],
\t'City': ['New York', 'Los Angeles', 'Chicago', 'Houston'],
\t'Score': [85.5, 90.2, 78.9, 92.3]
}

df = pd.DataFrame(data)
print("Data Collected")

# Plot
fig, ax = plt.subplots(figsize=(6, 2))  # Set size accordingly
ax.axis('off')  # No axes for table

# Create table
table = ax.table(
\tcellText=df.values,
\tcolLabels=df.columns,
\tcellLoc='center',
\tloc='center'
)

table.auto_set_font_size(False)
table.set_fontsize(12)
table.auto_set_column_width(col=list(range(len(df.columns))))

print("Data Generated")
plt.show()
`,
};

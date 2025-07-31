import tkinter as tk

# Create the main application window
root = tk.Tk()
root.title("Thrift Space")
root.geometry("800x600")

# Add a label and a button to the main window
label = tk.Label(root, text="Welcome to Thrift Space!", font=("Arial", 24))
label.pack(pady=20)

button = tk.Button(root, text="Click Me", command=lambda: print("Button clicked!"))
button.pack(pady=10)

#Run the application
root.mainloop()
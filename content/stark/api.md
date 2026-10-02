+++
title = 'Stark API reference'
description = 'JavaScript API reference for Stark window-management configuration.'
weight = 10
+++

> **Deprecated:** Stark is no longer updated. For a current setup, use [swm](/swm/) for window management and [skbd](/skbd/) for keyboard shortcuts.

Use the Stark JavaScript API in your `stark.js` configuration.

The classes below are available globally. Call static methods on the class, then use instance methods and fields on the objects they return.

Use the global `print` function to write debug output.

## Application

`Application` represents a running application. Check `isTerminated` before using a reference to an application that may have quit.

### Static methods

- **all()**: Return all running applications
- **focused()**: Return the focused application
- **find(string)**: Return the application with the given name

### Instance methods

- **windows()**: Return all known windows for the application
- **activate()**: Activate the application, bringing all windows forward
- **focus()**: Activate the application, bringing the main window forward
- **show()**: Show the application
- **hide()**: Hide the application
- **terminate()**: Quit the application

### Instance fields

- **name**: Name of the application
- **bundleID**: Bundle ID of the application
- **processID**: Process ID of the running application
- **isFrontmost**: Whether the application is currently the frontmost application
- **isHidden**: Whether the application is hidden
- **isTerminated**: Whether the application is terminated

## Window

`Window` represents an application window. Change its position and size with `setTopLeft`, `setSize`, or `setFrame`.

### Static methods

- **all()**: Return all known windows
- **focused()**: Return the focused window

### Instance methods

- **setFrame([rect](#rectangle))**: Set the top left point, and size of the window
- **setTopLeft([point](#point))**: Set the top left point of the window
- **setSize([size](#size))**: Set the size of the window
- **setFullScreen(boolean)**: Set whether the window should be fullscreen
- **minimize()**: Minimize the window
- **unminimize()**: Unminimize the window
- **focus()**: Focus the window
- **spaces()**: Return the spaces that contain the window

### Instance fields

- **id**: Unique identifier for the window
- **application**: Application the window belongs to
- **screen**: Screen the window is on
- **title**: Title of the window
- **frame**: Top left point and size of the window
- **topLeft**: Top left point of the window
- **size**: Size of the window
- **isStandard**: Whether the window is a standard window
- **isMain**: Whether the window is the main application window
- **isFullscreen**: Whether the window is fullscreen
- **isMinimized**: Whether the window is minimized

## Screen

`Screen` provides display dimensions and references to neighbouring screens.

### Static methods

- **all()**: Return all screens
- **focused()**: Return the focused screen

### Instance methods

- **spaces()**: Return all spaces for the screen
- **currentSpace()**: Return the current space for the screen

### Instance fields

- **id**: Unique identifier for the screen
- **flippedFrame**: Top left point and size of the screen
- **flippedVisibleFrame**: Top left point and size of the screen, adjusted for when the dock and menu bar are visible
- **next**: Next screen
- **previous**: Previous screen

## Space

`Space` provides information about Mission Control spaces. Stark cannot move windows between spaces on newer macOS versions.

### Static methods

- **all()**: Return all spaces
- **at(number)**: Return the space at the given index
- **active()**: Return the currently active space

### Instance methods

- **screens()**: Return all screens the space is on
- **windows()**: Return all windows on the space

### Instance fields

- **id**: Unique identifier for the space
- **isNormal**: Whether the space is a non-fullscreen space
- **isFullscreen**: Whether the space is a fullscreen space

## Keymap

`Keymap` registers keyboard shortcuts that call a function.

### Static methods

- **on(string, string[], () => void)**: Register the given key, modifiers combination, and callback function
- **off(string)**: Unregister the keymap with the given identifier

### Instance fields

- **id**: Unique identifier for the keymap
- **key**: Key for the keymap
- **modifiers**: Modifiers for the keymap

## Types

Methods and fields use these types for arguments and return values.

### Rectangle

- **x**
- **y**
- **width**
- **height**

### Point

- **x**
- **y**

### Size

- **width**
- **height**

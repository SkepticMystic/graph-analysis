# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/SkepticMystic/graph-analysis/compare/0.2.7...0.3.0) (2021-11-04)


### Features

* **commDetection:** :sparkles: Customisable iterations ([67b33ce](https://github.com/SkepticMystic/graph-analysis/commit/67b33ce0b01c628d255adb8799a7013b5baf6e12))
* **commDetection:** :sparkles: Label Propagation Analysis! ([cd14f11](https://github.com/SkepticMystic/graph-analysis/commit/cd14f11efbca13b97d7402a8cf5808cecc8adae7))
* Improved performance of label propagation ([fcfaebf](https://github.com/SkepticMystic/graph-analysis/commit/fcfaebfab16edc852abc0197299c53b0f738ab65))
* More iterations allowed for label propagation ([090b9ab](https://github.com/SkepticMystic/graph-analysis/commit/090b9abe082573a42625862fda35a9ab5e5529f2))


### Bug Fixes

* **commDetection:** :bug: A node shouldn't update all it's neighbours in one go ([c9fe8d9](https://github.com/SkepticMystic/graph-analysis/commit/c9fe8d9cddb340a4b256a611543665f8843e6a01))

### [0.2.7](https://github.com/SkepticMystic/graph-analysis/compare/0.2.6...0.2.7) (2021-11-04)


### Bug Fixes

* :bug: destroy old components on refresh/switch ([bce97ae](https://github.com/SkepticMystic/graph-analysis/commit/bce97ae931ee17613385431e40dd344664178e9c))

### [0.2.6](https://github.com/SkepticMystic/graph-analysis/compare/0.2.5...0.2.6) (2021-11-03)


### Bug Fixes

* :bug: Check if Jaccard.denom === 0 ([341dff4](https://github.com/SkepticMystic/graph-analysis/commit/341dff4dc666614744754f106aac6a8403b31a2e))

### [0.2.5](https://github.com/SkepticMystic/graph-analysis/compare/0.2.4...0.2.5) (2021-11-03)

### [0.2.4](https://github.com/SkepticMystic/graph-analysis/compare/0.2.3...0.2.4) (2021-11-03)

### [0.2.3](https://github.com/SkepticMystic/graph-analysis/compare/0.2.2...0.2.3) (2021-11-03)


### Features

* :sparkles: Show common neighbours tooltip on hover ([718b31a](https://github.com/SkepticMystic/graph-analysis/commit/718b31a438017df42cd639d42fba3c8fc9a882d7))


### Bug Fixes

* :bug: Check if !plugin.g in getPromiseResults ([d306e8f](https://github.com/SkepticMystic/graph-analysis/commit/d306e8fdbb0791407da8d881c4b8762850907ec6))
* :bug: Remember current analysis type when refreshing from cmd ([64ff1ae](https://github.com/SkepticMystic/graph-analysis/commit/64ff1ae348fdcf406ea07dd1cd643d9eb16e9c99))

### [0.2.2](https://github.com/SkepticMystic/graph-analysis/compare/0.2.1...0.2.2) (2021-11-02)


### Features

* :sparkles: Cmd to refresh graph ([31c2c11](https://github.com/SkepticMystic/graph-analysis/commit/31c2c119a37287b87629db4baaeba7cdd5fa0dfd))

### [0.2.1](https://github.com/SkepticMystic/graph-analysis/compare/0.2.0...0.2.1) (2021-11-02)

## [0.2.0](https://github.com/SkepticMystic/graph-analysis/compare/0.1.7...0.2.0) (2021-11-02)


### Features

* :sparkles: Add `linked` class for links in either direction ([8c57be7](https://github.com/SkepticMystic/graph-analysis/commit/8c57be7a4ea2972dde6699aa20314cd14177aae6))


### Bug Fixes

* Co-citations doesn't treat transclusions properly ([775bd1d](https://github.com/SkepticMystic/graph-analysis/commit/775bd1d91453baba546b7fe75ef69f616db08631))

### [0.1.7](https://github.com/SkepticMystic/graph-analysis/compare/0.1.6...0.1.7) (2021-11-02)

### [0.1.6](https://github.com/SkepticMystic/graph-analysis/compare/0.1.5...0.1.6) (2021-11-02)


### Bug Fixes

* :bug: hoverPreview doesn't work from community-lib ([bf77ea0](https://github.com/SkepticMystic/graph-analysis/commit/bf77ea017ca403009d4b5f3a2ff0f51b6b7484d1))

### [0.1.5](https://github.com/SkepticMystic/graph-analysis/compare/0.1.4...0.1.5) (2021-11-02)


### Bug Fixes

* Highlights in co-citation panes sometimes give incorrect results ([0661a0d](https://github.com/SkepticMystic/graph-analysis/commit/0661a0d9e9d303168a612df5208d59dce5d94330))
* Incorrect resolving for folder/name links ([6a1711c](https://github.com/SkepticMystic/graph-analysis/commit/6a1711cf11f034f4dd0ce7f647738c7203d77869))
* Varied capitalization link resolving ([1958b8e](https://github.com/SkepticMystic/graph-analysis/commit/1958b8e262eacd563d6909d8fc97159548430a7a))

### [0.1.4](https://github.com/SkepticMystic/graph-analysis/compare/0.1.3...0.1.4) (2021-11-01)

### [0.1.3](https://github.com/SkepticMystic/graph-analysis/compare/0.1.2...0.1.3) (2021-11-01)


### Features

* :lipstick: Finally an icon! ([2b3e02f](https://github.com/SkepticMystic/graph-analysis/commit/2b3e02f1bc83227940f19f9a261bc1163d7461f0))

### [0.1.2](https://github.com/SkepticMystic/graph-analysis/compare/0.1.1...0.1.2) (2021-11-01)


### Bug Fixes

* Cocitations - Correctly resolve improper capitalization and header links ([2e85864](https://github.com/SkepticMystic/graph-analysis/commit/2e85864729ff49d1a4c602298332bd2bf65b83db))

### [0.1.1](https://github.com/SkepticMystic/graph-analysis/compare/0.1.0...0.1.1) (2021-11-01)

## [0.1.0](https://github.com/SkepticMystic/graph-analysis/compare/0.0.38...0.1.0) (2021-11-01)


### Features

* :sparkles: Jump to `sentence` onClick and highlight ([f978722](https://github.com/SkepticMystic/graph-analysis/commit/f978722656de4705932eb360a398dcc9833809cd))


### Bug Fixes

* :bug: Properly await resolvedLinks completion ([69f6bd1](https://github.com/SkepticMystic/graph-analysis/commit/69f6bd1181ab29eb8d293aa4c169fb38d94a9093))

### [0.0.38](https://github.com/SkepticMystic/graph-analysis/compare/0.0.37...0.0.38) (2021-11-01)


### Features

* Much better performance of co-citations ([67b41e4](https://github.com/SkepticMystic/graph-analysis/commit/67b41e4a88acbac8f9b05f7dae16d794c9222c63))


### Bug Fixes

* :bug: Properly checkCallback ([73e86c6](https://github.com/SkepticMystic/graph-analysis/commit/73e86c63c9ade879efbe030879694d20fcf6dbdf))
* Better force reload handling ([15b1294](https://github.com/SkepticMystic/graph-analysis/commit/15b12941f474da5557614f11f684e13f1f9709d3))
* Crashes when reloading plugin ([1985918](https://github.com/SkepticMystic/graph-analysis/commit/19859183f0fcc477aa42552f76617cd10f6927df)), closes [#13](https://github.com/SkepticMystic/graph-analysis/issues/13)

### [0.0.37](https://github.com/SkepticMystic/graph-analysis/compare/0.0.36...0.0.37) (2021-10-29)

### [0.0.36](https://github.com/SkepticMystic/graph-analysis/compare/0.0.35...0.0.36) (2021-10-29)


### Bug Fixes

* :bug: checkCallback properly ([32bd6cf](https://github.com/SkepticMystic/graph-analysis/commit/32bd6cf0cf56e243fc413bd720ee71cac1bf6da9))

### [0.0.35](https://github.com/SkepticMystic/graph-analysis/compare/0.0.34...0.0.35) (2021-10-28)


### Bug Fixes

* :bug: Register view onload ([fe08521](https://github.com/SkepticMystic/graph-analysis/commit/fe08521cc0a4eb64b89b70d2a6144c1922c87dad))
* :label: Fix type errors ([4e18f39](https://github.com/SkepticMystic/graph-analysis/commit/4e18f394f4cbb8bf93a95991a18bab6b46d86d8b))

### [0.0.34](https://github.com/SkepticMystic/graph-analysis/compare/0.0.33...0.0.34) (2021-10-26)

### [0.0.33](https://github.com/SkepticMystic/graph-analysis/compare/0.0.32...0.0.33) (2021-10-26)


### Bug Fixes

* :bug: ? unload view plugin.onunload ([9879307](https://github.com/SkepticMystic/graph-analysis/commit/9879307eadfd001bdf9eb65e6b4b9896f2a67c28))
* :bug: Check sentence length to decide how many splits ([83a2eb4](https://github.com/SkepticMystic/graph-analysis/commit/83a2eb477ca1e1efdffe5ce09f71c429e5b9a073))
* :bug: Notename has .md in it edge case ([1f6c7fa](https://github.com/SkepticMystic/graph-analysis/commit/1f6c7fa6610f860a25941302a5700e64312de8cf))
* Crash in co-citations in case of failure to look up link ([a695698](https://github.com/SkepticMystic/graph-analysis/commit/a69569892dbad348132ea0413e5223159b2f6592))
* Invalid results with differently-capitalized links ([467427a](https://github.com/SkepticMystic/graph-analysis/commit/467427a051e8801cdef405716bf118644ef59ff7))

### [0.0.32](https://github.com/SkepticMystic/graph-analysis/compare/0.0.31...0.0.32) (2021-10-26)


### Features

* :sparkles: Add linkedQ class to co-cites ([2b8a80c](https://github.com/SkepticMystic/graph-analysis/commit/2b8a80cb00f083b405b7344ba5c47182bd865dae))


### Bug Fixes

* :bug: Keep same analysisType on refresh ([abfcd7b](https://github.com/SkepticMystic/graph-analysis/commit/abfcd7b21ccd9c16c9b6ca2549e7a17064ba029c))
* :bug: Remove testSubtype ([5575f8a](https://github.com/SkepticMystic/graph-analysis/commit/5575f8a1c3aea7d0b0deaa609b83f712062dfc2a))

### [0.0.31](https://github.com/SkepticMystic/graph-analysis/compare/0.0.30...0.0.31) (2021-10-26)


### Bug Fixes

* :bug: `community-lib` openOrSwitch gets currFile for you ([108b6e4](https://github.com/SkepticMystic/graph-analysis/commit/108b6e455cc4e2e99c412f861ce8d0c36d8ea574))

### [0.0.30](https://github.com/SkepticMystic/graph-analysis/compare/0.0.29...0.0.30) (2021-10-25)

### [0.0.29](https://github.com/SkepticMystic/graph-analysis/compare/0.0.28...0.0.29) (2021-10-25)

### [0.0.28](https://github.com/SkepticMystic/graph-analysis/compare/0.0.27...0.0.28) (2021-10-25)


### Features

* :sparkles: Refresh Index button ([fc6b6aa](https://github.com/SkepticMystic/graph-analysis/commit/fc6b6aa77fbfeb950e0af1606033d23cbac64fda))

### [0.0.27](https://github.com/SkepticMystic/graph-analysis/compare/0.0.26...0.0.27) (2021-10-25)


### Bug Fixes

* Better handling of indexing on initial load of Obsidian ([651b7ea](https://github.com/SkepticMystic/graph-analysis/commit/651b7ea5cc289ccb78c28bf822c633df44fdc0b6))

### [0.0.26](https://github.com/SkepticMystic/graph-analysis/compare/0.0.25...0.0.26) (2021-10-25)


### Bug Fixes

* :bug: Console log undefined var ([1ffed5b](https://github.com/SkepticMystic/graph-analysis/commit/1ffed5b9278b3a05e0b3dfa16e12bebf04177174))

### [0.0.25](https://github.com/SkepticMystic/graph-analysis/compare/0.0.24...0.0.25) (2021-10-11)


### Features

* :lipstick: Don't display entire path, only basename ([6d3ed29](https://github.com/SkepticMystic/graph-analysis/commit/6d3ed295ba306eb509c1d8d636eaa5755f7fd27f))

### [0.0.24](https://github.com/SkepticMystic/graph-analysis/compare/0.0.22...0.0.24) (2021-10-11)


### Features

* :lipstick: Highlight matches in coCites sentence ([1916a1a](https://github.com/SkepticMystic/graph-analysis/commit/1916a1a683265868177434fde479276ac4b08fd0))
* :sparkles: Better openOrSwitch ([f8e590e](https://github.com/SkepticMystic/graph-analysis/commit/f8e590eccde68915f67386e94bf4d6c49201c0cf))
* :sparkles: Co-Citations backlinks pane! ([a42cf63](https://github.com/SkepticMystic/graph-analysis/commit/a42cf630d2b6519bee837cebbeed92d34bf92eb2))


### Bug Fixes

* :bug: Fix similarity component with new Promised results ([05d78f9](https://github.com/SkepticMystic/graph-analysis/commit/05d78f901deb4f74376d2fc464509b102791951d))
* :bug: Somewhat fix LinkPrediction with new Promised results ([c6995b3](https://github.com/SkepticMystic/graph-analysis/commit/c6995b36c85b9e14503f95731ebb5380b2726102))
* 🐛 Fixed highlights being one character off ([afbbf23](https://github.com/SkepticMystic/graph-analysis/commit/afbbf23235378e9d1aa53d55ccbf262bc5ec34a2))

### [0.0.23](https://github.com/SkepticMystic/graph-analysis/compare/0.0.22...0.0.23) (2021-10-11)


### Features

* :lipstick: Highlight matches in coCites sentence ([1916a1a](https://github.com/SkepticMystic/graph-analysis/commit/1916a1a683265868177434fde479276ac4b08fd0))
* :sparkles: Better openOrSwitch ([f8e590e](https://github.com/SkepticMystic/graph-analysis/commit/f8e590eccde68915f67386e94bf4d6c49201c0cf))
* :sparkles: Co-Citations backlinks pane! ([a42cf63](https://github.com/SkepticMystic/graph-analysis/commit/a42cf630d2b6519bee837cebbeed92d34bf92eb2))


### Bug Fixes

* :bug: Fix similarity component with new Promised results ([05d78f9](https://github.com/SkepticMystic/graph-analysis/commit/05d78f901deb4f74376d2fc464509b102791951d))
* :bug: Somewhat fix LinkPrediction with new Promised results ([c6995b3](https://github.com/SkepticMystic/graph-analysis/commit/c6995b36c85b9e14503f95731ebb5380b2726102))
* 🐛 Fixed highlights being one character off ([afbbf23](https://github.com/SkepticMystic/graph-analysis/commit/afbbf23235378e9d1aa53d55ccbf262bc5ec34a2))

### [0.0.22](https://github.com/SkepticMystic/graph-analysis/compare/0.0.21...0.0.22) (2021-10-09)

### [0.0.21](https://github.com/SkepticMystic/graph-analysis/compare/0.0.20...0.0.21) (2021-10-09)


### Features

* :sparkles: Default analysis type option ([179eddb](https://github.com/SkepticMystic/graph-analysis/commit/179eddbec46c8e1e2bce27995102920702fa7c23))
* :sparkles: Right click to write link to yaml of current or target file ([910836b](https://github.com/SkepticMystic/graph-analysis/commit/910836b53baff0b536f2a6e915639804ab6dddcc))

### [0.0.20](https://github.com/SkepticMystic/graph-analysis/compare/0.0.19...0.0.20) (2021-10-08)


### Bug Fixes

* :bug: Bug fixes, simplifications ([6adb719](https://github.com/SkepticMystic/graph-analysis/commit/6adb719d55c1fdb76de5923d8bc88025740acc28))

### [0.0.19](https://github.com/SkepticMystic/graph-analysis/compare/0.0.18...0.0.19) (2021-10-08)

### [0.0.18](https://github.com/SkepticMystic/graph-analysis/compare/0.0.17...0.0.18) (2021-10-07)


### Features

* :sparkles: Add Co-Citations (danke Emile!) ([d3e15d3](https://github.com/SkepticMystic/graph-analysis/commit/d3e15d3c08abc0b22c6e357d52434762ed8814cf))

### [0.0.17](https://github.com/SkepticMystic/graph-analysis/compare/0.0.16...0.0.17) (2021-10-06)

### [0.0.16](https://github.com/SkepticMystic/graph-analysis/compare/0.0.15...0.0.16) (2021-10-06)

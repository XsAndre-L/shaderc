import {
  BuildType,
  CPP_OUTPUT_DIR,
  runPackageAction,
  CMAKE_TOOLS,
  getHostSysrootPath,
  SYSROOT,
  BuildConfiguration,
  LibraryInfo,
} from "../../../../src/providers/package.provider.ts";

import { resolve, join } from "node:path";
import { argv, env } from "node:process";

export const info: LibraryInfo = {
  name: "shaderc",
  outDir: "build",
  version: "16.0.0",
};

export const build = (cwd: string = process.cwd()): BuildType => {
  const { windows_x86_64, windows_aarch64, linux_x86_64, linux_aarch64 } =
    SYSROOT;

  const HOST_SYSROOT = getHostSysrootPath();
  const CLANG = join(HOST_SYSROOT, "bin/clang.exe").replace(/\\/g, "/");
  const CLANGXX = join(HOST_SYSROOT, "bin/clang++.exe").replace(/\\/g, "/");
  const WINDRES = join(HOST_SYSROOT, "bin/llvm-windres.exe").replace(
    /\\/g,
    "/"
  );
  const AARCH64_WINDRES = join(
    HOST_SYSROOT,
    "bin/aarch64-w64-mingw32-windres.exe"
  ).replace(/\\/g, "/");

  // Get the CODE_FRAME env variable
  const CODE_FRAME = env.CODE_FRAME;
  if (!CODE_FRAME) {
    throw new Error(
      "ERROR: CODE_FRAME environment variable is not set. Please set it to the root of your dependencies."
    );
  }

  // /d/Dev/codeframe-docs/CodeFramePackages/toolchains/llvm-mingw/bin/llvm-objdump.exe -f   /d/Dev/codeframe-docs/CodeFramePackages/lib-sources/vulkan/Vulkan-ValidationLayers/external/Windows/Release/aarch64/SPIRV-Tools/build/install/lib/libSPIRV-Tools.a   | grep -m1 -E 'architecture|file format'

  // Construct the path to your pkgconf.exe
  const PKG_CONFIG = join(
    CODE_FRAME,
    "dependencies/cpp/clang/bin/pkgconf.exe"
  ).replace(/\\/g, "/");

  return {
    type: "compilation",
    windows_x86_64: {
      configStep: `cmake -S . -B ${info.outDir}/windows/x86_64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLS}/windows_x86-64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=ON \
      -DUPDATE_DEPS=ON \
      -DBUILD_TESTS=OFF \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_RC_COMPILER=${WINDRES} \
      -DCMAKE_INSTALL_PREFIX=../${CPP_OUTPUT_DIR}/vulkan/${info.name}/windows/x86_64
      `,
      buildStep: `cmake --build ${info.outDir}/windows/x86_64 -j`,
      installStep: `cmake --install ${info.outDir}/windows/x86_64`,
    },
    windows_aarch64: {
      configStep: `cmake -S . -B ${info.outDir}/windows/aarch64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLS}/windows_aarch64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=OFF \
      -DUPDATE_DEPS=ON \
      -DBUILD_TESTS=OFF \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_RC_COMPILER=${AARCH64_WINDRES} \
      -DCMAKE_RC_FLAGS=--target=aarch64-w64-mingw32 \
      -DCMAKE_INSTALL_PREFIX=../${CPP_OUTPUT_DIR}/vulkan/${info.name}/windows/aarch64
      `,
      buildStep: `cmake --build ${info.outDir}/windows/aarch64 -j`,
      installStep: `cmake --install ${info.outDir}/windows/aarch64`,
    },
    linux_x86_64: {
      configStep: `cmake -S . -B ${info.outDir}/linux/x86_64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLS}/linux_x86-64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=OFF \
      -DUPDATE_DEPS=OFF \
      -DBUILD_TESTS=OFF \
      -DBUILD_WSI_XCB_SUPPORT=OFF \
      -DBUILD_WSI_XLIB_SUPPORT=OFF \
      -DBUILD_WSI_WAYLAND_SUPPORT=OFF \
      -DBUILD_WSI_DIRECTFB_SUPPORT=OFF \
      -DPKG_CONFIG_EXECUTABLE=${PKG_CONFIG} \
      -UWIN32 \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_C_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_ASM_COMPILER_TARGET=x86_64-unknown-linux-gnu \
      -DCMAKE_SYSTEM_PROCESSOR=x86_64 \
      -DCMAKE_INSTALL_PREFIX=../${CPP_OUTPUT_DIR}/vulkan/${info.name}/linux/x86_64,
      `,
      buildStep: `cmake --build ${info.outDir}/linux/x86_64 -j`,
      installStep: `cmake --install ${info.outDir}/linux/x86_64`,
    },
    linux_aarch64: {
      configStep: `cmake -S . -B ${info.outDir}/linux/aarch64 -G Ninja \
      -DCMAKE_TOOLCHAIN_FILE=${CMAKE_TOOLS}/linux_aarch64.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DBUILD_SHARED_LIBS=OFF \
      -DUPDATE_DEPS=OFF \
      -DBUILD_TESTS=OFF \
      -DBUILD_WSI_XCB_SUPPORT=OFF \
      -DBUILD_WSI_XLIB_SUPPORT=OFF \
      -DBUILD_WSI_WAYLAND_SUPPORT=OFF \
      -DBUILD_WSI_DIRECTFB_SUPPORT=OFF \
      -DPKG_CONFIG_EXECUTABLE=${PKG_CONFIG} \
      -UWIN32 \
      -DCMAKE_C_COMPILER=${CLANG} \
      -DCMAKE_CXX_COMPILER=${CLANGXX} \
      -DCMAKE_ASM_COMPILER=${CLANG} \
      -DCMAKE_C_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_CXX_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_ASM_COMPILER_TARGET=aarch64-unknown-linux-gnu \
      -DCMAKE_TRY_COMPILE_TARGET_TYPE=STATIC_LIBRARY \
      -DCMAKE_INSTALL_PREFIX=../${CPP_OUTPUT_DIR}/vulkan/${info.name}/linux/aarch64
      `,
      buildStep: `cmake --build ${info.outDir}/linux/aarch64 -j`,
      installStep: `cmake --install ${info.outDir}/linux/aarch64`,
    },
  } satisfies BuildType;
};

const args = argv.slice(2);
const [action = "help"] = args;

const buildConfig: BuildConfiguration = {
  info,
  build: build(),
};

await runPackageAction(action, process.cwd(), buildConfig);

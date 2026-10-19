<?php
// ==============================================================================
// Sehatuk Platform - Automatic Server-Side Extractor for Spaceship Hosting
// ==============================================================================
$zipFile = 'dist.zip';
$targetDir = './';

if (file_exists($zipFile)) {
    $zip = new ZipArchive;
    if ($zip->open($zipFile) === TRUE) {
        $zip->extractTo($targetDir);
        $zip->close();
        echo "<h2 style='color:green;font-family:sans-serif;'>SUCCESS: dist.zip extracted successfully! Your website is now live.</h2>";
        // Clean up zip and this script for security
        @unlink($zipFile);
        @unlink(__FILE__);
    } else {
        echo "<h2 style='color:red;font-family:sans-serif;'>ERROR: Failed to open $zipFile.</h2>";
    }
} else {
    echo "<h2 style='color:orange;font-family:sans-serif;'>ERROR: dist.zip not found in directory.</h2>";
}
?>

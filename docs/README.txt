
gf.rejuice
==========

**`gf.rejuice` provides additional tools for developers to use `Juicer`
for the compression of Javascript and CSS resources,
in the
context of python web applications that run via WSGI.**

**Q:** Is this for me, shall I use it?

**A:** If you develop javascript with some python based (WSGI) application, and you already
use Juicer, or consider using some method for compressing your resources, then you may
find `gf.rejuice` useful.

**This is a package under active development.**

**Q:** Is is safe to use it?

**A1:** No. Although it is well tested, it may contain bugs, or may not support your use
case. Things can also change substantially, in a following version.

**A2:** Yes, it is safe, because you actually only use it for development. It is not
even installed on the production website. So, the risk is minimal.

Objectives
----------

`gf.rejuice` attempts to provide additional tools for developers to use `Juicer` in the
context of python web applications that run via WSGI.

`Juicer`_ is a CSS and JavaScript packaging tool, that provides a method to compress 
(minify) and concatenate the
resources for a website or a software package. 
(Juicer supports the widely used and stable `YUI Compressor`_.)
This compression happens manually, offline.
Then, if this resource is used in a website page, the
page can use the compressed resources directly.

.. _Juicer: http://cjohansen.no/en/ruby/juicer_a_css_and_javascript_packaging_tool

.. _YUI Compressor: http://developer.yahoo.com/yui/compressor/

It is, however, very difficult or close to impossible to debug and develop websites with fully
compressed resources.
As a developer, my every day work routine needs an easy way to switch to a "development mode",
where I am able to access the original set of uncompressed, undeveloped resources.

One possible solution for this would be to provide two sets of resources from the website pages: one for
production that contains the compressed resources, and one for development. This can
be achieved in several ways, for example, by providing two sets of resources from the html headers
conditionally, or use some kind of registry that supports a Development / Production mode switch.
The problem with these approaches is that they almost always require
changes in the software and possibly extra administration, redundancy, which can be
especially painful if the project has many resources.

As an alternate solution, to avoid a dual set of resources, 
some tool can be used that supports the compression and
minification of the original sources on the fly. This however has the disadvantage that
due to the fact that even the most robust compression methods are prone to errors,
it is more difficult to verify the validity of the produced resources, than in offline
mode.

`gf.rejuice` attempts to provide a simple way to aid this process.
In comparision with existing tools, that support the compression and
minification of the original sources on the fly, `gf.rejuice` supports a workflow the other way around.
It takes the minified resources as the reference, and provides access to the uncompressed
resources for development.

It does this by providing a way to transparently switch a site
that contains and refers the compressed (minified) resources only, into development mode.
It does this without the need to change the original software and templates.
In addition, it also provides a way to automate the process of compressing or recompressing
the resources for production, in case this becomes necessary due to some changes
that have been made to the sources.


License
-------

`gf.rejuice` is dual-licensed by the GPLv2 and BSD licenses. You have to choose
any one or both of these licenses for the redistribution of this software.

`gf.rejuice` does not contain or redistribute Juicer itself, Juicer still needs to be
installed separately, but even this is not necessary for each use case.

Installation
------------

You need to install the `gf.rejuice` package to be importable from your project.
If you use buildout, this can be done by adding `gf.rejuice` to your egg section::

    eggs =
        ....
        gf.rejuice

In addition, you need to configure a `paster.ini` file that you will use for development.

To use the current newest development version, you can download the package from its
source repository and install it
package manually. Alternately, you can use a recipe like `gf.recipe.bzr` or similar from your buildout
to install the software directly from the source repository::

    [src]
        recipe = gf.recipe.bzr
        urls =
            bzr+ssh://gfpublic@greenfinity.hu/home/gfpublic/gf.rejuice/trunk gf.rejuice

(To use gf.recipe.bzr, you need to have Bazaar installed on your computer.)

Simple configuration
--------------------

To configure `gf.rejuice`, you need to provide a development configuration for paster.
This can be done by copying your original ini file to a second ini file.
Then, add the necessary configuration
to the development (second) ini.

For example, your application had a paster configuration file `myapp.ini`, and you
create a second `myapp-devel.ini` from it.

Following this, you can use paster with the original, unchanged ini file `myapp.ini` to run the
application in production mode, and the `myapp-devel.ini` file
will be used to run the application in development mode.

The following describes the parts to be added to `myapp-devel.ini` to produce a simple
working configuration::

    [filter:rejuice]
    use = egg:gf.rejuice#develjuice
    url_prefix = /static
    filepath  = egg:my.package/views/static

    # Resource composition:
    default.min.js       = default.js
    min/default.min.css  = custom/default.css

    [pipeline:main]
    pipeline =
        ...
        rejuice
        main_app


The WSGI filter section
"""""""""""""""""""""""

In the above example, the `[filter:rejuice]` section defines the wsgi middleware that does the transformation
from production resource urls produced by the the `main_app`, to the corresponding
development resource urls. Which application is generating the page to be transformed, 
or in which particular method this happens,
is ambivalent for this process.

The `url_prefix` and `filepath` parameters are needed to specify *where* the resources reside,
following that a resource list specifies *what* resources the WSGI filter should consider.


url_prefix, filepath: specifying the static tree of resources
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

The `url_prefix` and `filepath` parameters must always stand together with the actual list of resources.
Together they specify a static tree in your application.

`url_prefix` specify the prefix of the url where the root of this static tree appears in the
application's url space. The setting::

    url_prefix = /static

specifies that the `http://127.0.0.1:6543/static` url is the root of the static tree that your application
publishes.

`filepath` specifies where the same static tree can be found in the filesystem::

    filepath = views/static

In this example, the path is constructed relatively to the directory of the `myapp-devel.ini` configuration
file that holds the declaration.

Note that the `gf.rejuice` middleware does not actually publish this static tree, it still is the
responsibility of your application. The parameters are needed for url rewrite.


Specifying resource composition
"""""""""""""""""""""""""""""""

With the rest of the section content, you can specify a list of javascript or css resources here.
Anything ending with `.js` or `.css` will be considered to be a resource::

    default.min.js       = default.js
    min/default.min.css  = custom/default.css

Each line contains two values here. The value on the left of the equal sign specifies the 
compressed, minified resource (the result of compression). The right value specified the
original, uncompressed source (the origin of compression).
All file paths are applied relatively from the root of the static
tree, specified by `url_prefix` and `filepath`.

Later we will see that it is also possible to produce one resource from a list of resources,
which, in that case will be compressed and concatenated to a single resource. The configuration
allows a list of resources in multiple lines::

    default.min.js = 
        dependency.js
        ...
        default.js


Result of the configuration
---------------------------

Let's assume that you have the following resources specified from the head section of your html page::

    <script src="http://127.0.0.1:6543/static/default.min.js" type="text/javascript"></script>
    <link href="http://127.0.0.1:6543/static/min/default.min.css" type="text/css" rel="stylesheet">

The middleware will transform this to a website that loads the original sources::

    <script src="http://127.0.0.1:6543/static/default.js" type="text/javascript"></script>
    <link href="http://127.0.0.1:6543/static/custom/default.css" type="text/css" rel="stylesheet">

Juicer also allows to specify dependencies for the resources. The dependent resources
may also contain further dependencies. For further explanation, please read the
documentation of `juicer`.

`default.js`::

    /* @depends a/source_a.js
       @depends b/source_b.js
    */

`custom/default.css`::

    @import ../a/style_a.css
    @import ../b/style_b.css

The middleware will add the dependent javascript resources to the html headers. For css
this is not needed, as `@import` describes the inclusion dependencies in a native way for the browser.
The end result will be a html that contains the full set of original resources::

    <script src="http://127.0.0.1:6543/static/a/source_a.js" type="text/javascript"></script>
    <script src="http://127.0.0.1:6543/static/b/source_b.js" type="text/javascript"></script>
    <script src="http://127.0.0.1:6543/static/default.js" type="text/javascript"></script>
    <link href="http://127.0.0.1:6543/static/custom/default.css" type="text/css" rel="stylesheet">

For more complex examples on how to specify dependencies for `juicer`, you can look 
at the sources of the `Bottlecap UI`_, that provides the dependencies to compress the `jquery-ui` framework.

.. _Bottlecap UI: https://github.com/Pylons/bottlecap


Two ways to produce the same result
"""""""""""""""""""""""""""""""""""

Rather than specifying the dependencies in the style of Juicer, 
by using `@import` for css and `@depends` for js, the same results can be achieved
directly from the configuration as well::

    default.min.js =
        a/source_a.js
        b/source_b.js
        default.js
    min/default.min.css =
        a/style_a.css
        b/style_b.css
        custom/default.css

This configuration could replace and is equivalent with the usage of `@import` and `@depends`
in the above example.

Which one of the two ways are better to use, depends on use case and personal taste.


Compression
-----------

Although it is quite easy to use Juicer directly from the command line to produce the
compressed resources, `gf.rejuice` provides an automation for this.

To use Juicer, you must have Juicer and its dependencies already installed. The
documentation of Juicer describes this simple process. This installation
(including java and ruby) does not need to be present for the middleware to work,
only for carrying out the actual compression.

If you use buildout, you can enter the following from the command line::

    bin/rejuice paster_devel.ini filter:rejuice

With the example ini file described earlier, this will produce or reproduce both `default.min.js` and
`default.min.css` from their original sources. `filter:rejuice` here refers to
the juicer definition section from the ini file. Any extensions referred from this
section are also processed.

An extension section can also be specified directly::

    bin/rejuice another_config_file.ini juice_resources

If you do not use buildout, you can also run the `rejuice_script.py` file directly::

    python path/to/package/gf/rejuice/rejuice_script.py paster_devel.ini juice_resources



Advanced configuration
----------------------

In this section we explain the usage of all parameters. They belong to two groups: the first group
specifies which urls the middleware should consider for transformation at all, the second
group gives control over selecting the resources that should be considered, by specifying a static
tree and by specifying the resource composition itself.


Affecting which urls the middleware should consider
"""""""""""""""""""""""""""""""""""""""""""""""""""

The task of the middleware is to transform only resources that are on the same server as where the
page is. So it needs to decide which resources are local and which not.

By default, the middleware considers those resources as local, whose domain matches the domain
of the currently served page. To do this, nothing needs to be specified.

For example, if your application is served from this url::

    http://127.0.0.1:6543/

Then the following resources will be considered local, if they appear in the page header::

    http://127.0.0.1:6543/default.js
    http://127.0.0.1:6543/static/default.css
    /any/absolute/path/my.js
    any/relative/path/my.css

But the following resources will be considered remote, and thus ignored::

    http://github.com/jquery/qunit/raw/master/qunit/qunit.js
    http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/themes/smoothness/jquery-ui.css
    http://localhost:6543/static/default.css
    
This is adequate for most web applications, that generate resource names in a way that they
use the base domain of the currently served page. If this is not a case (note that `localhost` would not
be accepted as local if the page is served on `127.0.0.1`), or the use case needs finer control, there
are two parameters that make this possible.


base_urls: specifying the url host to consider
''''''''''''''''''''''''''''''''''''''''''''''

The `base_urls` parameter specifies the domain and prefix url for the static tree, in which
both the production and development resources must be available and accessible from the web.
Only the resources that match this url, will be transformed.

It is also possible to specify a list of urls for this, in which case any of the urls
will be considered for matching::

    base_urls =
        http://127.0.0.1:6543/
        http://localhost:6543/
        http://foo.bar/

One specific case when this is needed, if the local resources may have a different domain than
the base url of the page in which they are referred from. In this case you simply list all the
possible urls you may want to use during development. Specifying more does not do any harm,
besides making the designated resources local.


allow_request_url: disabling to consider the url host of the current request
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

`allow_request_url` is by default True, meaning that *both* the domains from `base_urls` *and*
the domain of the current request url designate the locality of resources.

It is possible to specify `allow_request_url` as False, in which case, the use of the request
url is prohibited, and only the declaration `base_urls` will be considered.

This would be useful, if your portal is not at the root of domain, for example, it is served from the following
root url::

    http://127.0.0.1:6543/myportal/...

In this case you would use the following specification, which will cause `url_prefix` to be applied
*after* the prefix you specify from `base_urls`::

    allow_request_url = false
    base_urls =
        http://127.0.0.1:6543/myportal
        http://localhost:6543/myportal
        http://foo.bar/myportal

Specifying `allow_request_url = false`, without also specifying `base_urls` to a sensible value, does not make sense,
although it will not yield an error. The middleware will simply do nothing,
not being able to identify any url as local.


Specifying the static tree containing the resources
"""""""""""""""""""""""""""""""""""""""""""""""""""

Each resource that `gf.rejuice` handles is part of a static tree.
Both the development, and the production resources
are in some static tree. This tree resides somewhere on the filesystem, and the application also
publishes this tree somewhere in its url space. The following parameters make it possible to define
this tree. Both `url_prefix` and `filepath` need to be defined together.

url_prefix: specifying the url prefix of the static tree root
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

The `url_prefix` parameter is an url path segment that
defines where the tree root is located in the application's url space:: 

    url_prefix = /static

The above example defines that the static tree url is::

    http://127.0.0.1:6543/static

The `/` in the beginning (or end) of the prefix is optional, that is, the following parameters
have an equivalent meaning::

    url_prefix = /static/path

::

    url_prefix = static/path

::

    url_prefix = /static/path/


filepath: specifying the static tree root in the filesystem
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

The application uses the`filepath` parameter to locate the static tree on
the filesystem. This must be the same static tree that is published under
the `url_prefix` parameter described earlier::

    filepath = views/static

If the path is a relative path, (does not starts with a `/`), then the path
will be interpreted relatively from the ini file that holds the declaration.

It is also possible to use an absolute file path::

    filepath = /Path/To/my/static/tree

It is also possible to specify a file path relative from a python egg::

    filepath = egg:my.package/views/static

The above declaration will locate the import location of the `my.package` egg,
and locate the tree from there, using the path section that follows the egg's name.

The parameters `url_prefix` and `filepath` need to be defined together.

Specifying and extending the composition of resources
"""""""""""""""""""""""""""""""""""""""""""""""""""""

`gf.rejuice` provides a simple and flexible way to define how the production (compressed)
resources are produced from the development resources (the original sources).

Specifying the composition of resources
'''''''''''''''''''''''''''''''''''''''

A list of javascript or css resources can be specified from the configuration file.
Anything ending with `.js` or `.css` will be considered to be a resource::

    default.min.js       = default.js
    min/default.min.css  = custom/default.css

Each line contains two values here. The value on the left of the equal sign specifies the 
path of the compressed, minified resource (the result of compression). The right value specifies the
path of original, uncompressed source (the origin of compression).


All file paths are applied relatively from the root of the static
tree, specified by `url_prefix` and `filepath`.


Derive a resource from a list of resources
''''''''''''''''''''''''''''''''''''''''''

It is also possible to produce one resource from a list of resources,
which, in that case will be compressed and concatenated to a single resource. The configuration
allows a list of resources in multiple lines::

    default.min.js = 
        dependency.js
        dependency2.js
        default.js
    min/default.min.css = 
        a/css1.css
        b/css2.css
        custom/default.css

Juicer's scheme for specifying resource dependencies from inside the resources (by using
`@import` from css files and `@depends` from commented parts of javascript files)
is also taken into consideration. But if such dependencies are specified from the
resources themselves, then they do not need to be (should not be) listed from the
configuration section as well.


extend_resources: adding more static trees to the configuration
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

For more flexibility, it is possible to define the resource composition from a separate
configuration file section. In this case the filter section will refer to this section
with the `extend_resources` parameter::

    [filter:rejuice]
    use = egg:gf.rejuice#develjuice
    base_urls = http://127.0.0.1:6543/static
    extend_resources = juice_resources

    [juice_resources]
    url_prefix = /static
    filepath  = views/static

    # Resource composition:
    default.min.js       = default.js
    min/default.min.css  = custom/default.css


The `extend_resources` option selects a section in the ini file,
that configures the actual resources to be considered for the transformation.

Instead of a single section, a list of sections can also be specified::

    extend_resources =
        juice_resources_1
        juice_resources_2


Extending resources from another configuration file
'''''''''''''''''''''''''''''''''''''''''''''''''''

Following the same syntax that `PasteDeploy` uses for extending its
configuration, it is also possible to extend the resources from
a section residing in an arbitrary .ini file::

    extend_resources = config:another_config_file.ini#juice_resources

This makes it possible to separate the resource configuration for `gf.rejuice`
into a separate file.

In the file `my-devel.ini` the following could be entered::

    [filter:rejuice]
    use = egg:gf.rejuice#develjuice
    base_urls = http://127.0.0.1:6543/static
    extend_resources = config:another_config_file.ini#juice_resources

While the referred file `another_config_file.ini` could look like this::

    [juice_resources]
    url_prefix = /static
    filepath  = egg:my.package/views/static

    # Resource composition:
    default.min.js       = default.js
    min/default.min.css  = custom/default.css


The config: prefix makes it possible to refer a configuration file
relatively from the location of the current configuration file::

    extend_resources = config:another_config_file.ini#juice_resources

Alternately, an absolute file path can be used as well::

    extend_resources = config:/Path/To/my/place/another_config_file.ini#juice_resources

Finally, the configuration file can be selected relative from a python egg import::

    extend_resources = egg:my.package/path/to/another_config_file.ini#juice_resources

Instead of a single extension section, a list of extension sections can also
be specified::

    extend_resources = 
        base_resources
        more_resources
        egg:my.package/path/to/another_config_file.ini#juice_resources_1
        egg:my.package/path/to/another_config_file.ini#juice_resources_2

Putting the resource declarations to a separate file makes it easier to manage them. The
configuration file behaves just as expected from python configfiles or Paster configuration
files. The `[DEFAULT]` section can specify a default value for the `url_prefix` and the
`filepath` parameters, which then each section in the same file inherits, or can overwrite::

    [DEFAULT]
    url_prefix = /static
    filepath  = egg:my.package/views/static

    [juice_resources_1]
    default.min.js       = default.js
    min/default.min.css  = custom/default.css

    [juice_resources_2]
    some_other.min.js    = some_other.js
    ...

    [juice_resources_3]
    url_prefix = /static2
    filepath  = egg:another.package/views/static

    different.min.js     = different.js
    ...


It is also possible, just as in every python config file, to use `%(varname)` style interpolation
anywhere inside the declarations. `%(here)` containing the full path of the current ini file, as
well as `%(__name__)` containing the name of the current section, are also available, just
as usual in the Paster configuration files. 


Importing resources from another static tree
''''''''''''''''''''''''''''''''''''''''''''

It is an important need to construct resources from another static tree than the one the final
resource will be located in. Important use cases are: reusing the concatenation scheme of a
resource defined elsewhere, or, making a site resource out of resources produced by separate
javascript checkouts, or python eggs.

A resource originating from another section can be specified by providing the section name,
following the resource path by one or more spaces::

    default.min.js = default.js othersection

In a more realistic example, the resource would typically be produced from a list
of resources from separate sections::

    [main]
    url_prefix = /static
    filepath = egg:my.site/views/static

    default.min.js =
        jquery-1.4.4.min.js       jquery_section
        jquery-ui-1.8.min.js      jquery-ui_section
        default.js
    extend_resources =
        jquery_section
        jquery-ui_section

    [jquery-section]
    url_prefix = /static-jquery
    filepath = egg:my.jquery/static

    [jquery-ui_section]
    url_prefix = /static-jquery-ui
    filepath = egg:my.jqueryui/static


Note that all the sections used as an import source, *must* also be listed in the `extend_resource`
parameter. Failing to do so, will result in an error message.

As seen from the above example, the resources imported from another section (`jquery-1.4.4.min.js`,
and `jquery-ui-1.8.min.js` in this case) need not be specified as resources in that
section. They just need to be present in the source tree.

If however the imported resources are not themselves compressed, they will be. Also, if they 
contain further dependencies specified by `@import` or `@depends`, these dependencies will
properly be included in the resulting resource.

If the referenced sections contain further resource concatenation rules, they will
be processed as well::

    [main]
    url_prefix = /static
    filepath = egg:my.site/views/static

    default.min.js =
        jquery-1.4.4.min.js       jquery_section
        jquery-ui-1.8.min.js      jquery-ui_section
        default.js
    extend_resources =
        jquery_section
        jquery-ui_section

    [jquery-section]
    url_prefix = /static-jquery
    filepath = egg:my.jquery/static
    
    jquery-1.4.4.min.js = jquery.1.4.4.js

    [jquery-ui_section]
    url_prefix = /static-jquery-ui
    filepath = egg:my.jqueryui/static

    jquery-ui-1.8.min.js =
        ui/jquery.ui.core.js        
        ui/jquery.ui.widget.js       
        ui/jquery.ui.mouse.js 
        ...
        ui/jquery.effects.transfer.js


What will result from this configuration, that the middleware will explode every single
resource to its development resources, recursively. Also, running `bin/rejuice myconfig.ini main`
will produce all resources specified in all sections, providing a complete update
based on the original sources.

To make the example even more realistic, let us suppose that each static tree
has a standalone configuration as well, which are referred from the configuration of the site.

`site.ini`::

    [main]
    url_prefix = /static
    filepath = views/static

    default.min.js =
        jquery-1.4.4.min.js     egg:my.jquery/juicer.ini#jquery_section
        jquery-ui-1.8.min.js    egg:my.jqueryui/juicer.ini#jquery-ui_section
        default.js
    extend_resources =
        egg:my.jquery/juicer.ini#jquery_section
        egg:my.jqueryui/juicer.ini#jquery-ui_section

`juicer.ini` in `my.jquery` egg::

    [jquery-section]
    url_prefix = /static-jquery
    filepath = views/static
    
    jquery-1.4.4.min.js = jquery.1.4.4.js

`juicer.ini` in `my.jqueryui` egg::

    [jquery-ui_section]
    url_prefix = /static-jquery-ui
    filepath = views/static

    jquery-ui-1.8.min.js =
        ui/jquery.ui.core.js        
        ui/jquery.ui.widget.js       
        ui/jquery.ui.mouse.js 
        ...
        ui/jquery.effects.transfer.js


Localizing images for imported css resources
''''''''''''''''''''''''''''''''''''''''''''

A valuable feature of `gf.rejuice` is the support of concatenation a single css resource
from foreign css resources, that is normally
not supported by Juicer and hard to be achieved by Juicer alone.
    
Css resources contain `url(...)` directives to refer to other resources, typically images.
While Juicer takes care of rewriting the urls in these directives, so that the original
resources can be located from the compressed css, the scheme will
stop working as soon as a css file is composed from many different source trees or eggs.

To support this use case, `gf.rejuice` copies all images referenced in the compressed
css file, that reside in different source trees. This only happens if a css image
compresses from any resource from a section which has a different `filepath` than
the target section.

For example, in case of a following configuration::

    [main]
    url_prefix = /static
    filepath = egg:my.package/views/static
    default.min.css =
        other_package.css        other_section
        default.css
    extend_resources = other_section

    [other_section]
    url_prefix = /other-static
    filepath = egg:other.package/static
   
if we run `bin/rejuice myconfig.ini main`, the result will be 
a `default.min.css` file, and a `default.min.css.images` directory,
created in the same directory next to each other. The `default.min.css.images`
directory will contain a copy of all the resources that `default.min.css`
references.

As a consequence of this, any other sections than the main section, are only needed
for development mode while the middleware resolves urls to the original sources,
and for the time when the compression is done by running `bin/rejuice`. Following
that, the other trees can be brought to offline as they are not needed to
be present in the production website at all, that operates solely on the
compressed resources.

This makes it possible to establish a development scheme, when the production
websites contains the compressed resources only, and the library dependencies,
present in checked-out static trees or development eggs, are only present
during the time of development.


Example use cases
-----------------

XXX


